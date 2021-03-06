// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const gapicConfig = require('./video_intelligence_service_client_config.json');
const gax = require('google-gax');
const path = require('path');

const VERSION = require('../../package.json').version;

/**
 * Service that implements Google Cloud Video Intelligence API.
 *
 * @class
 * @memberof v1p2beta1
 */
class VideoIntelligenceServiceClient {
  /**
   * Construct an instance of VideoIntelligenceServiceClient.
   *
   * @param {object} [options] - The configuration object. See the subsequent
   *   parameters for more details.
   * @param {object} [options.credentials] - Credentials object.
   * @param {string} [options.credentials.client_email]
   * @param {string} [options.credentials.private_key]
   * @param {string} [options.email] - Account email address. Required when
   *     using a .pem or .p12 keyFilename.
   * @param {string} [options.keyFilename] - Full path to the a .json, .pem, or
   *     .p12 key downloaded from the Google Developers Console. If you provide
   *     a path to a JSON file, the projectId option below is not necessary.
   *     NOTE: .pem and .p12 require you to specify options.email as well.
   * @param {number} [options.port] - The port on which to connect to
   *     the remote host.
   * @param {string} [options.projectId] - The project ID from the Google
   *     Developer's Console, e.g. 'grape-spaceship-123'. We will also check
   *     the environment variable GCLOUD_PROJECT for your project ID. If your
   *     app is running in an environment which supports
   *     {@link https://developers.google.com/identity/protocols/application-default-credentials Application Default Credentials},
   *     your project ID will be detected automatically.
   * @param {function} [options.promise] - Custom promise module to use instead
   *     of native Promises.
   * @param {string} [options.apiEndpoint] - The domain name of the
   *     API remote host.
   */
  constructor(opts) {
    opts = opts || {};
    this._descriptors = {};

    if (global.isBrowser) {
      // If we're in browser, we use gRPC fallback.
      opts.fallback = true;
    }

    // If we are in browser, we are already using fallback because of the
    // "browser" field in package.json.
    // But if we were explicitly requested to use fallback, let's do it now.
    const gaxModule = !global.isBrowser && opts.fallback ? gax.fallback : gax;

    const servicePath =
      opts.servicePath || opts.apiEndpoint || this.constructor.servicePath;

    // Ensure that options include the service address and port.
    opts = Object.assign(
      {
        clientConfig: {},
        port: this.constructor.port,
        servicePath,
      },
      opts
    );

    // Create a `gaxGrpc` object, with any grpc-specific options
    // sent to the client.
    opts.scopes = this.constructor.scopes;
    const gaxGrpc = new gaxModule.GrpcClient(opts);

    // Save the auth object to the client, for use by other methods.
    this.auth = gaxGrpc.auth;

    // Determine the client header string.
    const clientHeader = [];

    if (typeof process !== 'undefined' && 'versions' in process) {
      clientHeader.push(`gl-node/${process.versions.node}`);
    }
    clientHeader.push(`gax/${gaxModule.version}`);
    if (opts.fallback) {
      clientHeader.push(`gl-web/${gaxModule.version}`);
    } else {
      clientHeader.push(`grpc/${gaxGrpc.grpcVersion}`);
    }
    clientHeader.push(`gapic/${VERSION}`);
    if (opts.libName && opts.libVersion) {
      clientHeader.push(`${opts.libName}/${opts.libVersion}`);
    }

    // Load the applicable protos.
    // For Node.js, pass the path to JSON proto file.
    // For browsers, pass the JSON content.

    const nodejsProtoPath = path.join(
      __dirname,
      '..',
      '..',
      'protos',
      'protos.json'
    );
    const protos = gaxGrpc.loadProto(
      opts.fallback ? require('../../protos/protos.json') : nodejsProtoPath
    );

    const protoFilesRoot = opts.fallback
      ? gaxModule.protobuf.Root.fromJSON(require('../../protos/protos.json'))
      : gaxModule.protobuf.loadSync(nodejsProtoPath);

    // This API contains "long-running operations", which return a
    // an Operation object that allows for tracking of the operation,
    // rather than holding a request open.
    this.operationsClient = new gaxModule.lro({
      auth: gaxGrpc.auth,
      grpc: gaxGrpc.grpc,
    }).operationsClient(opts);

    const annotateVideoResponse = protoFilesRoot.lookup(
      'google.cloud.videointelligence.v1p2beta1.AnnotateVideoResponse'
    );
    const annotateVideoMetadata = protoFilesRoot.lookup(
      'google.cloud.videointelligence.v1p2beta1.AnnotateVideoProgress'
    );

    this._descriptors.longrunning = {
      annotateVideo: new gaxModule.LongrunningDescriptor(
        this.operationsClient,
        annotateVideoResponse.decode.bind(annotateVideoResponse),
        annotateVideoMetadata.decode.bind(annotateVideoMetadata)
      ),
    };

    // Put together the default options sent with requests.
    const defaults = gaxGrpc.constructSettings(
      'google.cloud.videointelligence.v1p2beta1.VideoIntelligenceService',
      gapicConfig,
      opts.clientConfig,
      {'x-goog-api-client': clientHeader.join(' ')}
    );

    // Set up a dictionary of "inner API calls"; the core implementation
    // of calling the API is handled in `google-gax`, with this code
    // merely providing the destination and request information.
    this._innerApiCalls = {};

    // Put together the "service stub" for
    // google.cloud.videointelligence.v1p2beta1.VideoIntelligenceService.
    const videoIntelligenceServiceStub = gaxGrpc.createStub(
      opts.fallback
        ? protos.lookupService(
            'google.cloud.videointelligence.v1p2beta1.VideoIntelligenceService'
          )
        : protos.google.cloud.videointelligence.v1p2beta1
            .VideoIntelligenceService,
      opts
    );

    // Iterate over each of the methods that the service provides
    // and create an API call method for each.
    const videoIntelligenceServiceStubMethods = ['annotateVideo'];
    for (const methodName of videoIntelligenceServiceStubMethods) {
      const innerCallPromise = videoIntelligenceServiceStub.then(
        stub => (...args) => {
          return stub[methodName].apply(stub, args);
        },
        err => () => {
          throw err;
        }
      );
      this._innerApiCalls[methodName] = gaxModule.createApiCall(
        innerCallPromise,
        defaults[methodName],
        this._descriptors.longrunning[methodName]
      );
    }
  }

  /**
   * The DNS address for this API service.
   */
  static get servicePath() {
    return 'videointelligence.googleapis.com';
  }

  /**
   * The DNS address for this API service - same as servicePath(),
   * exists for compatibility reasons.
   */
  static get apiEndpoint() {
    return 'videointelligence.googleapis.com';
  }

  /**
   * The port for this API service.
   */
  static get port() {
    return 443;
  }

  /**
   * The scopes needed to make gRPC calls for every method defined
   * in this service.
   */
  static get scopes() {
    return ['https://www.googleapis.com/auth/cloud-platform'];
  }

  /**
   * Return the project ID used by this class.
   * @param {function(Error, string)} callback - the callback to
   *   be called with the current project Id.
   */
  getProjectId(callback) {
    return this.auth.getProjectId(callback);
  }

  // -------------------
  // -- Service calls --
  // -------------------

  /**
   * Performs asynchronous video annotation. Progress and results can be
   * retrieved through the `google.longrunning.Operations` interface.
   * `Operation.metadata` contains `AnnotateVideoProgress` (progress).
   * `Operation.response` contains `AnnotateVideoResponse` (results).
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {string} [request.inputUri]
   *   Input video location. Currently, only
   *   [Google Cloud Storage](https://cloud.google.com/storage/) URIs are
   *   supported, which must be specified in the following format:
   *   `gs://bucket-id/object-id` (other URI formats return
   *   google.rpc.Code.INVALID_ARGUMENT). For more information, see
   *   [Request URIs](https://cloud.google.com/storage/docs/reference-uris).
   *   A video URI may include wildcards in `object-id`, and thus identify
   *   multiple videos. Supported wildcards: '*' to match 0 or more characters;
   *   '?' to match 1 character. If unset, the input video should be embedded
   *   in the request as `input_content`. If set, `input_content` should be unset.
   * @param {Buffer} [request.inputContent]
   *   The video data bytes.
   *   If unset, the input video(s) should be specified via `input_uri`.
   *   If set, `input_uri` should be unset.
   * @param {number[]} [request.features]
   *   Required. Requested video annotation features.
   *
   *   The number should be among the values of [Feature]{@link google.cloud.videointelligence.v1p2beta1.Feature}
   * @param {Object} [request.videoContext]
   *   Additional video context and/or feature-specific parameters.
   *
   *   This object should have the same structure as [VideoContext]{@link google.cloud.videointelligence.v1p2beta1.VideoContext}
   * @param {string} [request.outputUri]
   *   Optional. Location where the output (in JSON format) should be stored.
   *   Currently, only [Google Cloud Storage](https://cloud.google.com/storage/)
   *   URIs are supported, which must be specified in the following format:
   *   `gs://bucket-id/object-id` (other URI formats return
   *   google.rpc.Code.INVALID_ARGUMENT). For more information, see
   *   [Request URIs](https://cloud.google.com/storage/docs/reference-uris).
   * @param {string} [request.locationId]
   *   Optional. Cloud region where annotation should take place. Supported cloud
   *   regions: `us-east1`, `us-west1`, `europe-west1`, `asia-east1`. If no region
   *   is specified, a region will be determined based on video file location.
   * @param {Object} [options]
   *   Optional parameters. You can override the default settings for this call, e.g, timeout,
   *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/interfaces/CallOptions.html} for the details.
   * @param {function(?Error, ?Object)} [callback]
   *   The function which will be called with the result of the API call.
   *
   *   The second parameter to the callback is a [gax.Operation]{@link https://googleapis.github.io/gax-nodejs/classes/Operation.html} object.
   * @returns {Promise} - The promise which resolves to an array.
   *   The first element of the array is a [gax.Operation]{@link https://googleapis.github.io/gax-nodejs/classes/Operation.html} object.
   *   The promise has a method named "cancel" which cancels the ongoing API call.
   *
   * @example
   *
   * const videoIntelligence = require('@google-cloud/video-intelligence');
   *
   * const client = new videoIntelligence.v1p2beta1.VideoIntelligenceServiceClient({
   *   // optional auth parameters.
   * });
   *
   * const inputUri = 'gs://cloud-samples-data/video/cat.mp4';
   * const featuresElement = 'LABEL_DETECTION';
   * const features = [featuresElement];
   * const request = {
   *   inputUri: inputUri,
   *   features: features,
   * };
   *
   * // Handle the operation using the promise pattern.
   * client.annotateVideo(request)
   *   .then(responses => {
   *     const [operation, initialApiResponse] = responses;
   *
   *     // Operation#promise starts polling for the completion of the LRO.
   *     return operation.promise();
   *   })
   *   .then(responses => {
   *     const result = responses[0];
   *     const metadata = responses[1];
   *     const finalApiResponse = responses[2];
   *   })
   *   .catch(err => {
   *     console.error(err);
   *   });
   *
   * const inputUri = 'gs://cloud-samples-data/video/cat.mp4';
   * const featuresElement = 'LABEL_DETECTION';
   * const features = [featuresElement];
   * const request = {
   *   inputUri: inputUri,
   *   features: features,
   * };
   *
   * // Handle the operation using the event emitter pattern.
   * client.annotateVideo(request)
   *   .then(responses => {
   *     const [operation, initialApiResponse] = responses;
   *
   *     // Adding a listener for the "complete" event starts polling for the
   *     // completion of the operation.
   *     operation.on('complete', (result, metadata, finalApiResponse) => {
   *       // doSomethingWith(result);
   *     });
   *
   *     // Adding a listener for the "progress" event causes the callback to be
   *     // called on any change in metadata when the operation is polled.
   *     operation.on('progress', (metadata, apiResponse) => {
   *       // doSomethingWith(metadata)
   *     });
   *
   *     // Adding a listener for the "error" event handles any errors found during polling.
   *     operation.on('error', err => {
   *       // throw(err);
   *     });
   *   })
   *   .catch(err => {
   *     console.error(err);
   *   });
   *
   * const inputUri = 'gs://cloud-samples-data/video/cat.mp4';
   * const featuresElement = 'LABEL_DETECTION';
   * const features = [featuresElement];
   * const request = {
   *   inputUri: inputUri,
   *   features: features,
   * };
   *
   * // Handle the operation using the await pattern.
   * const [operation] = await client.annotateVideo(request);
   *
   * const [response] = await operation.promise();
   */
  annotateVideo(request, options, callback) {
    if (options instanceof Function && callback === undefined) {
      callback = options;
      options = {};
    }
    request = request || {};
    options = options || {};

    return this._innerApiCalls.annotateVideo(request, options, callback);
  }
}

module.exports = VideoIntelligenceServiceClient;
