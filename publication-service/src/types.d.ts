// publication-service/types.d.ts
declare namespace Express {
    interface Request {
        user?: any;
        file?: Express.Multer.File;
    }
}