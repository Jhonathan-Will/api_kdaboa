import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { createHash } from 'crypto';
import { extname, join } from 'path';
import * as fs from 'fs';

@Injectable()
export class ImageHandlePipe implements PipeTransform {

    constructor(private readonly path: string,
                private readonly create: boolean) {}

    transform(file: Express.Multer.File, metadata: ArgumentMetadata) {
        const oneKb = 1000;
        if (file.size > 5 * oneKb * oneKb) {
            throw new Error('File size exceeds the maximum limit of 5MB.');
        }
        
        const place = join(__dirname, "..", "..", "images", this.path).replace("dist", "src");
        const hash = createHash('sha256').update(file.buffer).digest('hex');
        const extension = extname(file.originalname);

        if(!this.create) {
            const existingFiles = fs.readdirSync(place).find(f => f.startsWith(file.originalname))
            
            if (existingFiles) {
                return this.saveFile(`${existingFiles}`, null, file);
            }
        }

        const randomPart = Math.round(Math.random() * 1E12).toString().slice(-10);
        const uniqueSuffix = hash + "-" + Date.now() + '-' + randomPart;
        
        return this.saveFile(`${uniqueSuffix}${extension}`, join(place, `${uniqueSuffix}${extension}`), file);

    }

    private saveFile(fileName: string, path: string | null, file: Express.Multer.File) {
        file.filename = fileName;

        if (path !== null) {

            const anyFile = file as any;
            if (anyFile.buffer && Buffer.isBuffer(anyFile.buffer)) {
                fs.writeFileSync(path, anyFile.buffer);
                file.path = path;
            } else if (file.path) {
                fs.renameSync(file.path, path);
                file.path = path;
            } else {
                throw new Error('Cannot save file: no buffer or temp path available.');
            }
        }

        return file
    }
}
