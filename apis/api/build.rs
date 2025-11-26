use vespera;

fn main() {
    // Generate OpenAPI JSON using vespera
    let json = vespera::vespera_openapi!();
    // INSERT_YOUR_CODE
    // Copy openapi.json to ../../packages/api/openapi.json (create parent dir if needed)
    let packages_path = std::path::Path::new("../../apps");
    for package in packages_path.read_dir().unwrap() {
        let package_path = package.unwrap().path();
        let package_openapi_path = package_path.join("openapi.json");

        std::fs::write(package_openapi_path, json).unwrap();
    }
}
