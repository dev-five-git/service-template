mod routes;

use std::{env, net::SocketAddr};
use tower_http::cors::CorsLayer;
use vespera::axum::http::{HeaderValue, Method};

#[tokio::main]
async fn main() {
    // let config = Config::from_env();
    let port = env::var("PORT")
        .unwrap_or("8000".to_string())
        .parse::<u16>()
        .unwrap();

    // let db = create_db_connection(&config.database_url).await;

    // let state = AppState { db, config };
    let app = vespera::vespera!().layer(
        CorsLayer::new()
            .allow_origin("http://localhost:3000".parse::<HeaderValue>().unwrap())
            .allow_methods([
                Method::GET,
                Method::POST,
                Method::PUT,
                Method::DELETE,
                Method::OPTIONS,
            ])
            .allow_headers([
                vespera::axum::http::header::CONTENT_TYPE,
                vespera::axum::http::header::AUTHORIZATION,
            ]),
    );

    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    println!("API server is running on port {}", port);
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    vespera::axum::serve(listener, app).await.unwrap();
}
