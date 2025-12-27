import { existsSync, mkdirSync } from "fs";
import { diskStorage } from "multer";
import { extname } from "path";
import { v4 as uuidv4 } from 'uuid';

const createFolderIfNotExists = (folderPath: string) => {
    if (!existsSync(folderPath)) {
        mkdirSync(folderPath, {recursive: true});
    }
};

export const multerOptions = {
    storage: diskStorage({
        destination(req, file, cb) {
            let folder = '';

            if (file.fieldname === 'preview') {
                folder = './uploads/images';
            } else if (file.fieldname === 'audio') {
                folder = './uploads/music';
            }

            createFolderIfNotExists(folder);
            cb(null, folder);
        },
        filename: (req, file, cb) => {
            const uniqueName = uuidv4();
            const ext = extname(file.originalname);
            cb(null, `${uniqueName}${ext}`);
        }
    }),
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'preview' && !file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
            return cb(new Error("Only images are allowed"), false);
        }

        if (file.fieldname === 'audio' && !file.mimetype.match(/\/(mpeg|mp3|wav|ogg)$/)) {
            return cb(new Error("Only audio files are allowed"), false);
        }

        cb(null, true);
    }
};

// export const imagesUpload = {
//     storage: diskStorage({
//         destination: './uploads/images',
//         filename: (req, file, cb) => {
//             const randomName = uuidv4();
//             cb(null, `${randomName}${extname(file.originalname)}`);
//         }
//     })
// }

// export const musicUpload = {
//     storage: diskStorage({
//         destination: './uploads/music',
//         filename: (req, file, cb) => {
//             const randomName = uuidv4();
//             cb(null, `${randomName}${extname(file.originalname)}`);
//         }
//     })
// }