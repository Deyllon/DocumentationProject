import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { DocumentationService } from './documentation/documentation.service'; 

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const docService = app.get(DocumentationService);
  const document = docService.generateDocs();
  
  // cast to any to bypass strict type checks against the official OpenAPIObject interface if needed
  SwaggerModule.setup('docs', app, document as any);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
