import { MeterProvider } from '@opentelemetry/sdk-metrics-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { SimpleSpanProcessor, BatchSpanProcessor, ConsoleSpanExporter, } from '@opentelemetry/sdk-trace-base';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus'
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { ExpressInstrumentation, ExpressRequestHookInformation } from 'opentelemetry-instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { Span, Baggage } from '@opentelemetry/api';
import { AlwaysOnSampler, AlwaysOffSampler, ParentBasedSampler, TraceIdRatioBasedSampler } from '@opentelemetry/core';
import { IORedisInstrumentation } from '@opentelemetry/instrumentation-ioredis'
import { serviceSyncDetector } from 'opentelemetry-resource-detector-service';
import { CollectorTraceExporter, CollectorMetricExporter, } from '@opentelemetry/exporter-collector';
//import WsInstrumentation from './ws-instrumentation/ws';


const init = function (serviceName: string, metricPort: number) {

    // Define metrics
    // const metricExporter = new PrometheusExporter({ port: metricPort }, () => {
    //     console.log(`scrape: http://localhost:${metricPort}${PrometheusExporter.DEFAULT_OPTIONS.endpoint}`);
    // });
    const metricExporter = new CollectorMetricExporter({
        url: 'http://localhost:4318/v1/metrics'
    })
    const meter = new MeterProvider({ exporter: metricExporter, interval: 100000 }).getMeter(serviceName);

    // Define traces
    const traceExporter = new JaegerExporter({ endpoint: 'http://localhost:14268/api/traces'});

//*********************zipkin***********************************

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

////////*************End zip kin config */


    const provider = new NodeTracerProvider({
        resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: serviceName
        }),
        sampler:new ParentBasedSampler({
            root: new TraceIdRatioBasedSampler(1)
        })
    });
    // const traceExporter = new CollectorTraceExporter({
    //     url: 'http://localhost:4318/v1/trace'
    // })
    provider.addSpanProcessor(new SimpleSpanProcessor(traceExporter));
    provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
    provider.addSpanProcessor(new SimpleSpanProcessor(traceExporter_zipkin));


    provider.register();
    registerInstrumentations({
        instrumentations: [
            new ExpressInstrumentation({
                requestHook: (span, reqInfo) => {
                    span.setAttribute('request-headers',JSON.stringify(reqInfo.req.headers))
                }
            }),
            new HttpInstrumentation(),
            new ExpressInstrumentation()
           // new IORedisInstrumentation(),
            //new WsInstrumentation()
        ]
    });
    const tracer = provider.getTracer(serviceName);
    return { meter, tracer };
}

export default init;