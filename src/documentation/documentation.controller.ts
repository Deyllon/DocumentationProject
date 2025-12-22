import { Controller, Get, Header } from '@nestjs/common';
import { DocumentationService } from './documentation.service'; 

@Controller()
export class DocumentationController {
  constructor(private readonly documentationService: DocumentationService) {}

  @Get('api-doc')
  getDocs() {
    return this.documentationService.generateDocs();
  }

  @Get('postman')
  getPostman() {
    return this.documentationService.generatePostman();
  }

  @Get('postman/environment')
  getEnvironments() {
    return this.documentationService.generateEnvironments();
  }

  @Get('docs')
  @Header('Content-Type', 'text/html')
  getSwaggerUI() {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>API Documentation</title>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js" crossorigin></script>
        <script>
          window.onload = () => {
            window.ui = SwaggerUIBundle({
              url: '/api-doc',
              dom_id: '#swagger-ui',
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIBundle.SwaggerUIStandalonePreset
              ],
              layout: "BaseLayout",
            });
          };
        </script>
      </body>
      </html>
    `;
  }
}
