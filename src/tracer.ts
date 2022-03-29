const opentelemetry = require('@opentelemetry/api');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { SimpleSpanProcessor, ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-base');
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');

const { ExpressInstrumentation, ExpressRequestHookInformation } = require('@opentelemetry/instrumentation-express');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');

module.exports = (serviceName) => {

  //Specify zipkin url. defualt url is http://localhost:9411/api/v2/spans
  const zipkinUrl = 'http://localhost';
  const zipkinPort = '9411';
  const zipkinPath = '/api/v2/spans';
  const zipkinURL = `${zipkinUrl}:${zipkinPort}${zipkinPath}`;

  const options = {
    headers: {
      'my-header': 'header-value',
    },
    url: zipkinURL,
    //serviceName: 'your-application-name',
    
   
    // optional interceptor
    getExportRequestHeaders: () => {
      return {
        'my-header': 'header-value',
      }
    }
  }
  const traceExporter_zipkin = new ZipkinExporter(options);

  const provider = new NodeTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    }),
  });

  provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
  provider.addSpanProcessor(new SimpleSpanProcessor(traceExporter_zipkin));

  provider.register();

  registerInstrumentations({
    instrumentations: [
      // new ExpressInstrumentation({
      //     requestHook: (span, reqInfo) => {
      //         span.setAttribute('request-headers',JSON.stringify(reqInfo.req.headers))
      //     }
      // }),
      new ExpressInstrumentation(),
      new HttpInstrumentation()
    ],
  });

  return opentelemetry.trace.getTracer(serviceName);
};
