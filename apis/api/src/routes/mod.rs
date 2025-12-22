#[vespera::route(get, path = "/health")]
pub async fn health() -> &'static str {
    "ok"
}
