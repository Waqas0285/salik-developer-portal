import type { SdkItem } from "@/types";

export const SDKS: SdkItem[] = [
  { id: "sdk-java", name: "Salik Java SDK", language: "Java", version: "2.4.0", description: "Typed client for the JVM ecosystem with OkHttp transport.", installCommand: "implementation 'ae.salik:salik-sdk:2.4.0'" },
  { id: "sdk-javascript", name: "Salik JavaScript SDK", language: "JavaScript", version: "3.1.2", description: "Browser + Node compatible client with automatic retries.", installCommand: "npm install @salik/sdk" },
  { id: "sdk-node", name: "Salik Node.js SDK", language: "Node.js", version: "3.1.2", description: "Server-side SDK with built-in webhook signature verification.", installCommand: "npm install @salik/node-sdk" },
  { id: "sdk-python", name: "Salik Python SDK", language: "Python", version: "1.9.0", description: "Pythonic client with async support via httpx.", installCommand: "pip install salik-sdk" },
  { id: "sdk-dotnet", name: "Salik .NET SDK", language: ".NET", version: "2.2.1", description: "Strongly typed client for .NET 6+.", installCommand: "dotnet add package Salik.Sdk" },
  { id: "sdk-go", name: "Salik Go SDK", language: "Go", version: "1.5.0", description: "Idiomatic Go client with context-aware requests.", installCommand: "go get github.com/salik-demo/salik-go-sdk" },
  { id: "sdk-kotlin", name: "Salik Kotlin SDK", language: "Kotlin", version: "2.4.0", description: "Kotlin-first wrapper around the Java SDK with coroutines support.", installCommand: "implementation 'ae.salik:salik-kotlin-sdk:2.4.0'" },
  { id: "sdk-swift", name: "Salik Swift SDK", language: "Swift", version: "1.6.0", description: "Swift package for iOS/macOS integrations.", installCommand: ".package(url: \"https://github.com/salik-demo/salik-swift-sdk\", from: \"1.6.0\")" },
  { id: "sdk-flutter", name: "Salik Flutter SDK", language: "Flutter", version: "1.3.0", description: "Dart/Flutter client for cross-platform mobile apps.", installCommand: "flutter pub add salik_sdk" },
  { id: "sdk-android", name: "Salik Android SDK", language: "Android", version: "2.4.0", description: "Native Android wrapper with Jetpack lifecycle awareness.", installCommand: "implementation 'ae.salik:salik-android-sdk:2.4.0'" },
  { id: "sdk-ios", name: "Salik iOS SDK", language: "iOS", version: "1.6.0", description: "Native iOS wrapper built on the Swift SDK.", installCommand: "pod 'SalikSDK', '~> 1.6'" },
];

export const DEV_TOOLS = [
  { id: "postman", name: "Postman Collection", description: "Full collection covering all 30 published APIs, pre-configured for sandbox." },
  { id: "insomnia", name: "Insomnia Collection", description: "Equivalent collection for the Insomnia REST client." },
  { id: "openapi-yaml", name: "OpenAPI YAML (bundle)", description: "Combined OpenAPI 3.0 spec for every published API, YAML format." },
  { id: "openapi-json", name: "OpenAPI JSON (bundle)", description: "Combined OpenAPI 3.0 spec for every published API, JSON format." },
  { id: "sample-apps", name: "Sample Applications", description: "Reference implementations for parking payment and wallet top-up flows." },
  { id: "quickstart", name: "Quick-start Templates", description: "Minimal starter projects for Node.js, Python, and Java." },
  { id: "cli", name: "Salik CLI", description: "Command-line tool for managing applications and tailing sandbox request logs." },
  { id: "webhook-verify", name: "Webhook Verification Utility", description: "Standalone script to verify HMAC signatures on incoming webhook payloads." },
  { id: "signature-gen", name: "Signature Generation Utility", description: "Generates HMAC signatures for testing your webhook receiver." },
];
