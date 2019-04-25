import swaggerUi from 'swagger-ui-express';
import swagger from '../../api/documentation/swagger.json';

const enableSwagger = app => {
  app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup( swagger, true, {
    authAction :{
      Bearer: {
        name: "Bearer",
        schema: {
          type: "apiKey", in: "header", name: "Authorization", description: ""}, value: "Bearer <Bearer>"
      }
    }
  }));
};

export { enableSwagger };
