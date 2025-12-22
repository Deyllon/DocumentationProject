import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { PATH_METADATA, METHOD_METADATA, PIPES_METADATA, GUARDS_METADATA } from '@nestjs/common/constants';
import { RequestMethod } from '@nestjs/common';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe'; 
import { ZodObject, z } from 'zod';
import { API_DESCRIPTION_KEY } from 'src/common/decorators/api-description.decorator';

@Injectable()
export class DocumentationService {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
  ) {}

  generatePostman() {
    const controllers = this.discoveryService.getControllers();
    
    const collection = {
      info: {
        name: 'API Collection',
        description: 'collection',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      },
      item: [],
      variable: [
        {
          key: 'baseUrl',
          value: 'http://localhost:3000',
          type: 'string',
        },
      ],
    };

    const controllerFolders = new Map<string, any[]>();

    // Group requests by controller
    controllers.forEach((wrapper) => {
      const { instance, metatype } = wrapper;
      if (!instance || !metatype) return;

      const controllerPath = this.reflector.get<string>(PATH_METADATA, metatype) || '';
      const controllerName = metatype.name.replace('Controller', '');
      
      if (!controllerFolders.has(controllerName)) {
        controllerFolders.set(controllerName, []);
      }

      const prototype = Object.getPrototypeOf(instance);
      const methods = Object.getOwnPropertyNames(prototype)
        .filter((method) => method !== 'constructor');

      methods.forEach((methodName) => {
        const method = prototype[methodName];
        const methodPath = this.reflector.get<string>(PATH_METADATA, method);
        const requestMethod = this.reflector.get<number>(METHOD_METADATA, method);

        if (requestMethod !== undefined) {
          const fullPath = this.normalizePath(`/${controllerPath}/${methodPath}`);
          const httpMethod = this.mapRequestMethod(requestMethod);

          const item: any = {
            name: `${httpMethod.toUpperCase()} ${fullPath}`,
            request: {
              method: httpMethod.toUpperCase(),
              header: [
                {
                  key: 'Content-Type',
                  value: 'application/json',
                },
              ],
              url: {
                raw: `{{baseUrl}}${fullPath}`,
                host: ['{{baseUrl}}'],
                path: fullPath.split('/').filter(p => p),
              },
            },
          };

          // Add request body if present
          const pipes = this.reflector.get<any[]>(PIPES_METADATA, method);
          if (pipes && Array.isArray(pipes)) {
            const zodPipe = pipes.find((pipe) => pipe instanceof ZodValidationPipe);
            if (zodPipe) {
              const schema = zodPipe.getSchema();
              const jsonSchema = this.zodToOpenApi(schema);
              item.request.body = {
                mode: 'raw',
                raw: JSON.stringify(this.schemaToExample(jsonSchema), null, 2),
                options: {
                  raw: {
                    language: 'json',
                  },
                },
              };
            }
          }

          // Add auth if security is required
          const guards = this.reflector.get<any[]>(GUARDS_METADATA, method);
          if (guards && Array.isArray(guards) && guards.length > 0) {
            item.request.auth = {
              type: 'bearer',
              bearer: [
                {
                  key: 'token',
                  value: '{{bearerToken}}',
                  type: 'string',
                },
              ],
            };
          }

          controllerFolders.get(controllerName)!.push(item);
        }
      });
    });

    // Convert controller folders to Postman folder structure
    controllerFolders.forEach((items, folderName) => {
      collection.item.push({
        name: folderName,
        item: items,
      } as never);
    });

    // Add bearer token variable if any endpoint uses auth
    const hasAuth = Array.from(controllerFolders.values())
      .flat()
      .some((item: any) => item.request.auth);
    
    if (hasAuth) {
      collection.variable.push({
        key: 'bearerToken',
        value: '',
        type: 'string',
      });
    }

    return collection;
  }

  generateEnvironments() {
    const environment = 
      {
        id: 'dev-env-' + Date.now(),
        name: 'Development',
        values: [
          {
            key: 'baseUrl',
            value: 'http://localhost:3000',
            type: 'default',
            enabled: true,
          },
          {
            key: 'bearerToken',
            value: '',
            type: 'default',
            enabled: true,
          },
           {
            key: 'stageUrl',
            value: 'https://staging.api.example.com',
            type: 'default',
            enabled: true,
          },
          {
            key: 'prodUrl',
            value: 'https://api.example.com',
            type: 'default',
            enabled: true,
          },
        ],
        color: null,
        _postman_variable_scope: 'environment',
        _postman_exported_at: new Date().toISOString(),
        _postman_exported_using: 'Custom Generator',
      }

    return environment;
  }

  private schemaToExample(schema: any): any {
    if (schema.type === 'object' && schema.properties) {
      const example: Record<string, any> = {};
      for (const [key, prop] of Object.entries(schema.properties as any) as any) {
        example[key] = prop.example || this.getDefaultValue(prop.type, prop.format);
      }
      return example;
    }
    return schema.example || {};
  }

  private getDefaultValue(type: string, format?: string): any {
    if (format === 'email') return 'user@example.com';
    switch (type) {
      case 'string': return 'string';
      case 'number': return 0;
      case 'boolean': return false;
      case 'array': return [];
      default: return null;
    }
  }

  generateDocs() {
    const controllers = this.discoveryService.getControllers();
    const paths: Record<string, any> = {};
    const tags: Array<{ name: string; description: string }> = [];
    const tagNames = new Set<string>();

    controllers.forEach((wrapper) => {
      const { instance, metatype } = wrapper;
      if (!instance || !metatype) {
        return;
      }

      const controllerPath = this.reflector.get<string>(PATH_METADATA, metatype) || '';
      const controllerName = metatype.name.replace('Controller', '');
      
      if (!tagNames.has(controllerName)) {
        tagNames.add(controllerName);
        tags.push({
          name: controllerName,
          description: `${controllerName} endpoints`,
        });
      }
      
      const prototype = Object.getPrototypeOf(instance);
      const methods = Object.getOwnPropertyNames(prototype)
        .filter((method) => method !== 'constructor');

      methods.forEach((methodName) => {
        const method = prototype[methodName];
        
        const methodPath = this.reflector.get<string>(PATH_METADATA, method);
        const requestMethod = this.reflector.get<number>(METHOD_METADATA, method);

        if (requestMethod !== undefined) {
           const fullPath = this.normalizePath(`/${controllerPath}/${methodPath}`);
           const httpMethod = this.mapRequestMethod(requestMethod);

           if (!paths[fullPath]) {
             paths[fullPath] = {};
           }

           const operation: any = {
             operationId: `${metatype.name}_${methodName}`,
             summary: `Endpoint for ${methodName}`,
             tags: [controllerName],
             responses: {
               '200': {
                 description: 'Successful response',
               },
             },
           };

           const customDescription = this.reflector.get<string>(API_DESCRIPTION_KEY, method);
           if (customDescription) {
             operation.description = customDescription;
           }

           // Extract query parameters
          
           const paramMetadata = Reflect.getMetadata('__routeArguments__', prototype.constructor, methodName) || {};
           const parameters: any[] = [];
           
           Object.keys(paramMetadata).forEach((key) => {
             const param = paramMetadata[key];
             const paramType = key.split(':')[0]; 
             
           
             if (paramType === '4' && param.data) {
               parameters.push({
                 name: param.data,
                 in: 'query',
                 required: false,
                 schema: {
                   type: 'string',
                 },
               });
             } else if (paramType === '5' && param.data) {
               parameters.push({
                 name: param.data,
                 in: 'path',
                 required: true,
                 schema: {
                   type: 'string',
                 },
               });
             }
           });

           if (parameters.length > 0) {
             operation.parameters = parameters;
           }


           const pipes = this.reflector.get<any[]>(PIPES_METADATA, method);
           if (pipes && Array.isArray(pipes)) {
             const zodPipe = pipes.find((pipe) => pipe instanceof ZodValidationPipe);
             if (zodPipe) {
               const schema = zodPipe.getSchema();
               const jsonSchema = this.zodToOpenApi(schema);
               operation.requestBody = {
                 content: {
                   'application/json': {
                     schema: jsonSchema,
                   },
                 },
               };
             }
           }

           const guards = this.reflector.get<any[]>(GUARDS_METADATA, method);
           if (guards && Array.isArray(guards) && guards.length > 0) {
               
               operation.security = [{ bearerAuth: [] }];
           }

           paths[fullPath][httpMethod] = operation;
        }
      });
    });

    return {
      openapi: '3.0.0',
      info: {
        title: 'Generated API Documentation',
        version: '1.0.0',
      },
      tags,
      paths,
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    };
  }

  private normalizePath(path: string): string {
    return path.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
  }

  private mapRequestMethod(method: number): string {
    switch (method) {
      case RequestMethod.GET: return 'get';
      case RequestMethod.POST: return 'post';
      case RequestMethod.PUT: return 'put';
      case RequestMethod.DELETE: return 'delete';
      case RequestMethod.PATCH: return 'patch';
      case RequestMethod.OPTIONS: return 'options';
      case RequestMethod.HEAD: return 'head';
      case RequestMethod.ALL: return 'all';
      default: return 'get';
    }
  }

  private zodToOpenApi(schema: z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>): any {
    try {
        let result: any = { type: 'string' }; // Default

        if (schema instanceof ZodObject) {
            const properties: Record<string, any> = {};
            const required: string[] = [];

            for (const [key, value] of Object.entries(schema.shape)) {
                   
              const fieldType = value._def.type;
              
              const field: any = {
                type: fieldType,
                example: "",
                description: ""
              };
              
              if (value.description) {
                try {
                  const metadata = JSON.parse(value.description);
                  if (metadata.example) {
                    field.example = metadata.example;
                  }
                  if (metadata.description) {
                    field.description = metadata.description;
                  }
                } catch (e) {
                  field.description = value.description;
                }
              }
              
              properties[key] = field;
              
              if (!value.isOptional || !value.isOptional()) {
                required.push(key);
              }
            }
            
            result = {
                type: 'object',
                properties,
                required: required.length > 0 ? required : undefined
            };
        } 
        
        return result;
    } catch (e) {
        console.error('Error in zodToOpenApi:', e);
        return { type: 'object' };
    }
  }
}
