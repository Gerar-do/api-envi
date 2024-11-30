import { Request, Response } from 'express';
import { UserRepository } from '../../repositories/UserRepository';
import bcrypt from 'bcrypt';
import twilio from 'twilio';

const userRepository = new UserRepository();
const recoveryTokens = new Map<string, { token: string; expires: Date; userId: number }>();

const TWILIO_WHATSAPP_NUMBER = 'whatsapp:+14155238886';

const formatPhoneNumber = (phone: string): string => {
  console.log('Formato inicial del teléfono:', phone);
  
  let cleaned = phone.replace(/\D/g, '');
  console.log('Teléfono después de remover caracteres no numéricos:', cleaned);
  
  if (cleaned.startsWith('52')) {
    cleaned = cleaned.substring(2);
  }
  
  if (cleaned.startsWith('1')) {
    cleaned = cleaned.substring(1);
  }

  if (cleaned.length !== 10) {
    throw new Error(`El número debe tener 10 dígitos. Recibidos: ${cleaned.length}. Número limpio: ${cleaned}`);
  }

  const finalNumber = `+521${cleaned}`;
  console.log('Número final formateado:', finalNumber);
  return finalNumber;
};

const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  console.log('Verificando credenciales de Twilio:');
  console.log('TWILIO_ACCOUNT_SID:', accountSid ? 'Configurado' : 'No configurado');
  console.log('TWILIO_AUTH_TOKEN:', authToken ? 'Configurado' : 'No configurado');

  if (!accountSid || !authToken) {
    throw new Error('Credenciales de Twilio no configuradas correctamente en .env');
  }

  return twilio(accountSid, authToken);
};

export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  console.log('Iniciando solicitud de recuperación de contraseña');
  
  try {
    const { telefono } = req.body;
    console.log('Número de teléfono recibido:', telefono);

    if (!telefono) {
      res.status(400).json({ message: 'El número de teléfono es requerido' });
      return;
    }

    let formattedPhone: string;
    try {
      formattedPhone = formatPhoneNumber(telefono);
      console.log('Número formateado correctamente:', formattedPhone);
    } catch (error) {
      console.error('Error al formatear el número:', error);
      res.status(400).json({ 
        message: (error as Error).message,
        details: 'El número debe tener 10 dígitos sin prefijo internacional'
      });
      return;
    }

    const user = await userRepository.getUserByPhone(telefono);
    if (!user) {
      console.warn(`No se encontró usuario para el teléfono: ${telefono}`);
      res.status(404).json({ 
        message: 'Usuario no encontrado',
        debug: `Teléfono buscado: ${telefono}`,
        note: 'Asegúrate de que el número esté registrado en el sistema'
      });
      return;
    }

    console.log('Usuario encontrado:', { id: user.id, telefono: user.telefono });

    const token = Math.floor(1000 + Math.random() * 9000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000);
    recoveryTokens.set(formattedPhone, { token, expires, userId: user.id });

    console.log('Token generado:', { 
      token,
      expires: expires.toISOString(),
      phoneNumber: formattedPhone
    });

    try {
      console.log('Iniciando envío de mensaje por Twilio');
      const client = getTwilioClient();
      
      console.log('Preparando mensaje con los siguientes datos:');
      console.log('Número destino:', `whatsapp:${formattedPhone}`);
      console.log('Número origen:', TWILIO_WHATSAPP_NUMBER);
      
      const message = await client.messages.create({
        body: `Tu código de recuperación de contraseña es: ${token} (válido por 15 minutos)`,
        from: TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:${formattedPhone}`
      });

      console.log('Mensaje enviado exitosamente');
      console.log('MessageSID:', message.sid);
      console.log('Estado del mensaje:', message.status);
      console.log('Precio del mensaje:', message.price);
      console.log('Error del mensaje (si existe):', message.errorMessage);

    } catch (error) {
      console.error('Error detallado al enviar mensaje de Twilio:');
      if (error instanceof Error) {
        console.error('Nombre del error:', error.name);
        console.error('Mensaje de error:', error.message);
        console.error('Stack trace:', error.stack);
        console.error('Código de error:', (error as any).code);
        console.error('Más información:', (error as any).moreInfo || 'N/A');
      }
      console.error('Error completo:', JSON.stringify(error, null, 2));
      
      res.status(500).json({ 
        message: 'Error al enviar el código de recuperación. Por favor, inténtelo nuevamente.',
        debug: {
          errorMessage: error instanceof Error ? error.message : 'Error desconocido',
          phoneNumber: formattedPhone
        },
        instructions: [
          'Verifica que hayas enviado "join <palabra>" al número +14155238886 en WhatsApp',
          'Asegúrate de que el número esté correctamente registrado en el sandbox de Twilio',
          'Confirma que las credenciales de Twilio estén correctamente configuradas'
        ]
      });
      return;
    }

    res.json({ 
      message: 'Código de recuperación enviado por WhatsApp',
      phoneNumber: formattedPhone,
      note: 'Si no recibes el mensaje, sigue estos pasos:',
      instructions: [
        '1. Abre WhatsApp y agrega el número +1 415 523 8886',
        '2. Envía el mensaje "join <palabra>" (reemplaza <palabra> con la palabra proporcionada por Twilio)',
        '3. Espera la confirmación de Twilio',
        '4. Intenta la recuperación de contraseña nuevamente'
      ]
    });

  } catch (error) {
    console.error('Error general en requestPasswordReset:', error);
    console.error('Stack trace:', (error as Error).stack);
    res.status(500).json({ 
      message: 'Error al procesar la solicitud de recuperación de contraseña',
      debug: error instanceof Error ? error.message : 'Error desconocido'
    }); 
  }
};

export const verifyAndResetPassword = async (req: Request, res: Response): Promise<void> => {
  console.log('Iniciando verificación y reseteo de contraseña');
  
  try {
    const { telefono, token, newPassword } = req.body;
    console.log('Datos recibidos:', { 
      telefono,
      tokenLength: token?.length,
      passwordLength: newPassword?.length 
    });

    if (!telefono || !token || !newPassword) {
      res.status(400).json({ 
        message: 'Todos los campos son requeridos',
        required: ['telefono', 'token', 'newPassword'],
        received: {
          telefono: !!telefono,
          token: !!token,
          newPassword: !!newPassword
        }
      });
      return;
    }

    if (!/^\d{4}$/.test(token)) {
      res.status(400).json({ 
        message: 'El código debe ser de 4 dígitos',
        received: token.length
      });
      return;
    }

    let formattedPhone: string;
    try {
      formattedPhone = formatPhoneNumber(telefono);
      console.log('Número formateado para verificación:', formattedPhone);
    } catch (error) {
      console.error('Error al formatear el número para verificación:', error);
      res.status(400).json({ message: (error as Error).message });
      return;
    }

    const recoveryData = recoveryTokens.get(formattedPhone);
    console.log('Datos de recuperación encontrados:', recoveryData ? {
      userId: recoveryData.userId,
      tokenMatch: recoveryData.token === token,
      isExpired: new Date() > recoveryData.expires
    } : 'No encontrados');
    
    if (!recoveryData) {
      console.warn(`No se encontró token de recuperación para el teléfono: ${formattedPhone}`);
      res.status(400).json({ 
        message: 'Código inválido o expirado',
        note: 'Puede que necesites solicitar un nuevo código de recuperación'
      });
      return;
    }

    if (recoveryData.token !== token) {
      console.warn(`Token inválido para el teléfono: ${formattedPhone}`);
      console.warn(`Token esperado: ${recoveryData.token}, Token recibido: ${token}`);
      res.status(400).json({ 
        message: 'Código inválido',
        note: 'Verifica que hayas ingresado correctamente el código de 4 dígitos'
      });
      return;
    }

    if (new Date() > recoveryData.expires) {
      recoveryTokens.delete(formattedPhone);
      console.warn(`Token expirado para el teléfono: ${formattedPhone}`);
      console.warn(`Expiró en: ${recoveryData.expires}`);
      res.status(400).json({ 
        message: 'Código expirado',
        note: 'El código ha expirado. Por favor, solicita uno nuevo'
      });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ 
        message: 'La contraseña debe tener al menos 8 caracteres',
        currentLength: newPassword.length
      });
      return;
    }

    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      console.log('Hash generado correctamente:', {
        hashLength: hashedPassword.length,
        isValid: hashedPassword.startsWith('$2b$')
      });

      // Actualizar la contraseña
      console.log('Actualizando contraseña para usuario:', recoveryData.userId);
      const updatedUser = await userRepository.updateUser(recoveryData.userId, { 
        contraseña: hashedPassword 
      });

      if (!updatedUser) {
        throw new Error('No se pudo actualizar el usuario en la base de datos');
      }

      // Enviar mensaje de confirmación por WhatsApp
      try {
        console.log('Enviando mensaje de confirmación por WhatsApp...');
        const client = getTwilioClient();
        
        const confirmationMessage = await client.messages.create({
          body: `Tu contraseña ha sido modificada exitosamente. Si no realizaste este cambio, contacta inmediatamente a soporte.`,
          from: TWILIO_WHATSAPP_NUMBER,
          to: `whatsapp:${formattedPhone}`
        });

        console.log('Mensaje de confirmación enviado:', {
          sid: confirmationMessage.sid,
          status: confirmationMessage.status
        });
      } catch (error) {
        console.error('Error al enviar mensaje de confirmación:', error);
      }

      // Eliminar el token usado
      recoveryTokens.delete(formattedPhone);

      console.log(`Contraseña restablecida exitosamente para el usuario con ID: ${recoveryData.userId}`);

      res.json({ 
        message: 'Contraseña actualizada exitosamente',
        success: true,
        userId: recoveryData.userId,
        userUpdated: true
      });

    } catch (error) {
      console.error('Error en el proceso de actualización:', error);
      console.error('Stack trace:', (error as Error).stack);
      
      res.status(500).json({ 
        message: 'Error al actualizar la contraseña',
        error: error instanceof Error ? error.message : 'Error desconocido',
        details: 'Ocurrió un error al intentar actualizar la contraseña en la base de datos'
      });
    }

  } catch (error) {
    console.error('Error general en verifyAndResetPassword:', error);
    console.error('Stack trace:', (error as Error).stack);
    res.status(500).json({ 
      message: 'Error al procesar la solicitud de actualización de contraseña',
      debug: error instanceof Error ? error.message : 'Error desconocido'
    }); 
  }
};

export const cleanupExpiredTokens = (): void => {
  const now = new Date();
  let cleanedCount = 0;
  
  recoveryTokens.forEach((data, phone) => {
    if (data.expires < now) {
      recoveryTokens.delete(phone);
      cleanedCount++;
    }
  });
  
  if (cleanedCount > 0) {
    console.log(`Limpieza de tokens completada. ${cleanedCount} tokens expirados eliminados.`);
  }
};

setInterval(cleanupExpiredTokens, 60 * 60 * 1000);