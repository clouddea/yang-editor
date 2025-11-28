// image-code-generator.ts
import * as fs from 'fs';
import * as path from 'path';

interface ImageData {
  [key: string]: string;
}

class ImageCodeGenerator {
  private imagesDir: string;
  private outputFile: string;
  private supportedFormats: Set<string>;

  constructor(imagesDir: string = '../images', outputFile: string = 'images.ts') {
    this.imagesDir = path.resolve(__dirname, imagesDir);
    this.outputFile = path.resolve(__dirname, outputFile);
    this.supportedFormats = new Set(['.png', '.svg', '.jpg', '.jpeg']);
  }

  /**
   * 检查文件是否为支持的图片格式
   */
  private isSupportedImage(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return this.supportedFormats.has(ext);
  }

  /**
   * 将图片文件转换为 base64 data URL
   */
  private async imageToDataUrl(filePath: string): Promise<string> {
    try {
      const fileBuffer = await fs.promises.readFile(filePath);
      const base64Data = fileBuffer.toString('base64');
      const ext = path.extname(filePath).toLowerCase();
      
      let mimeType: string;
      switch (ext) {
        case '.svg':
          mimeType = 'image/svg+xml';
          break;
        case '.png':
          mimeType = 'image/png';
          break;
        case '.jpg':
        case '.jpeg':
          mimeType = 'image/jpeg';
          break;
        default:
          mimeType = 'application/octet-stream';
      }
      
      return `data:${mimeType};base64,${base64Data}`;
    } catch (error) {
      throw new Error(`Failed to convert image ${filePath}: ${error}`);
    }
  }

  /**
   * 递归获取所有图片文件
   */
  private async getAllImageFiles(dir: string): Promise<string[]> {
    const imageFiles: string[] = [];

    async function traverse(currentDir: string) {
      const items = await fs.promises.readdir(currentDir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item.name);
        
        if (item.isDirectory()) {
          await traverse(fullPath);
        } else if (item.isFile()) {
          const ext = path.extname(item.name).toLowerCase();
          if (['.png', '.svg', '.jpg', '.jpeg'].includes(ext)) {
            imageFiles.push(fullPath);
          }
        }
      }
    }

    await traverse(dir);
    return imageFiles;
  }

  /**
   * 生成合法的 TypeScript 标识符名称
   */
  private generatePropertyName(filePath: string, baseDir: string): string {
    // 获取相对于基础目录的路径
    const relativePath = path.relative(baseDir, filePath);
    
    // 移除扩展名，并将路径分隔符转换为下划线
    const withoutExt = relativePath.replace(/\.[^/.]+$/, '');
    let propertyName = withoutExt.replace(/[\/\\-]/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    
    // 确保以字母或下划线开头
    if (!/^[a-zA-Z_]/.test(propertyName)) {
      propertyName = '_' + propertyName;
    }
    
    return propertyName;
  }

  /**
   * 生成 TypeScript 代码
   */
  private generateTypeScriptCode(imageData: ImageData): string {
    const properties = Object.entries(imageData)
      .map(([key, value]) => `  ${key}: '${value}'`)
      .join(',\n');

    return `// Auto-generated file - DO NOT EDIT
// This file contains base64 encoded images

export const images = {
${properties}
};

export type ImageKeys = keyof typeof images;
`;
  }

  /**
   * 主函数：生成图片代码文件
   */
  async generate(): Promise<void> {
    try {
      console.log('Starting image code generation...');
      
      // 检查图片目录是否存在
      if (!fs.existsSync(this.imagesDir)) {
        throw new Error(`Images directory not found: ${this.imagesDir}`);
      }

      // 获取所有图片文件
      const imageFiles = await this.getAllImageFiles(this.imagesDir);
      console.log(`Found ${imageFiles.length} image files`);

      if (imageFiles.length === 0) {
        console.warn('No image files found in the specified directory');
        return;
      }

      // 转换所有图片为 data URL
      const imageData: ImageData = {};
      
      for (const filePath of imageFiles) {
        try {
          const dataUrl = await this.imageToDataUrl(filePath);
          const propertyName = this.generatePropertyName(filePath, this.imagesDir);
          
          imageData[propertyName] = dataUrl;
          console.log(`Processed: ${path.relative(this.imagesDir, filePath)} -> ${propertyName}`);
        } catch (error) {
          console.error(`Error processing ${filePath}:`, error);
        }
      }

      // 生成 TypeScript 代码
      const tsCode = this.generateTypeScriptCode(imageData);
      
      // 写入文件
      await fs.promises.writeFile(this.outputFile, tsCode, 'utf-8');
      
      console.log(`✅ Successfully generated ${this.outputFile}`);
      console.log(`📊 Total images processed: ${Object.keys(imageData).length}`);
      
    } catch (error) {
      console.error('❌ Error generating image code:', error);
      throw error;
    }
  }
}

// start generate codes
async function main() {
  const generator = new ImageCodeGenerator('../images', '../src/images.ts');
  await generator.generate();
}

main().catch(console.error);
