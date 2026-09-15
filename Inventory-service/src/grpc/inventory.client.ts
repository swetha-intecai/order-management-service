import {credentials, loadPackageDefinition} from "@grpc/grpc-js";
import {loadSync} from "@grpc/proto-loader";
import path from "path";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const protoPath = path.join(__dirname, "inventory.proto");

const packageDefinition = loadSync(protoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const inventoryProto = loadPackageDefinition(packageDefinition) as any;
const client = new inventoryProto.inventory.InventoryService(
  `localhost:${process.env.GRPC_PORT || "50051"}`,
  credentials.createInsecure(),
);



