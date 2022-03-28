"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sdk_metrics_base_1 = require("@opentelemetry/sdk-metrics-base");
const sdk_trace_node_1 = require("@opentelemetry/sdk-trace-node");
const sdk_trace_base_1 = require("@opentelemetry/sdk-trace-base");
const resources_1 = require("@opentelemetry/resources");
const semantic_conventions_1 = require("@opentelemetry/semantic-conventions");
const exporter_jaeger_1 = require("@opentelemetry/exporter-jaeger");
const exporter_zipkin_1 = require("@opentelemetry/exporter-zipkin");
const instrumentation_1 = require("@opentelemetry/instrumentation");
const opentelemetry_instrumentation_express_1 = require("opentelemetry-instrumentation-express");
const instrumentation_http_1 = require("@opentelemetry/instrumentation-http");
const core_1 = require("@opentelemetry/core");
const exporter_collector_1 = require("@opentelemetry/exporter-collector");
//import WsInstrumentation from './ws-instrumentation/ws';
const init = function (serviceName, metricPort) {
    // Define metrics
    // const metricExporter = new PrometheusExporter({ port: metricPort }, () => {
    //     console.log(`scrape: http://localhost:${metricPort}${PrometheusExporter.DEFAULT_OPTIONS.endpoint}`);
    // });
    const metricExporter = new exporter_collector_1.CollectorMetricExporter({
        url: 'http://localhost:4318/v1/metrics'
    });
    const meter = new sdk_metrics_base_1.MeterProvider({ exporter: metricExporter, interval: 100000 }).getMeter(serviceName);
    // Define traces
    const traceExporter = new exporter_jaeger_1.JaegerExporter({ endpoint: 'http://localhost:14268/api/traces' });
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
        serviceName: 'your-application-name',
        // optional interceptor
        getExportRequestHeaders: () => {
            return {
                'my-header': 'header-value',
            };
        }
    };
    const traceExporter_zipkin = new exporter_zipkin_1.ZipkinExporter(options);
    const provider = new sdk_trace_node_1.NodeTracerProvider({
        resource: new resources_1.Resource({
            [semantic_conventions_1.SemanticResourceAttributes.SERVICE_NAME]: serviceName
        }),
        sampler: new core_1.ParentBasedSampler({
            root: new core_1.TraceIdRatioBasedSampler(1)
        })
    });
    // const traceExporter = new CollectorTraceExporter({
    //     url: 'http://localhost:4318/v1/trace'
    // })
    provider.addSpanProcessor(new sdk_trace_base_1.SimpleSpanProcessor(traceExporter));
    provider.addSpanProcessor(new sdk_trace_base_1.SimpleSpanProcessor(new sdk_trace_base_1.ConsoleSpanExporter()));
    provider.addSpanProcessor(new sdk_trace_base_1.SimpleSpanProcessor(traceExporter_zipkin));
    provider.register();
    (0, instrumentation_1.registerInstrumentations)({
        instrumentations: [
            new opentelemetry_instrumentation_express_1.ExpressInstrumentation({
                requestHook: (span, reqInfo) => {
                    span.setAttribute('request-headers', JSON.stringify(reqInfo.req.headers));
                }
            }),
            new instrumentation_http_1.HttpInstrumentation(),
            new opentelemetry_instrumentation_express_1.ExpressInstrumentation()
            // new IORedisInstrumentation(),
            //new WsInstrumentation()
        ]
    });
    const tracer = provider.getTracer(serviceName);
    return { meter, tracer };
};
exports.default = init;
