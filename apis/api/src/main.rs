//! Run with
//!
//! ```not_rust
//! cargo run -p example-cors
//! ```

use axum::{
    Json, Router,
    http::{HeaderValue, Method},
    response::IntoResponse,
    routing::get,
};
use std::{env, net::SocketAddr};
use tower_http::cors::CorsLayer;

#[tokio::main]
async fn main() {
    let app = Router::new().route("/", get(json)).layer(
        // see https://docs.rs/tower-http/latest/tower_http/cors/index.html
        // for more details
        //
        // pay attention that for some request types like posting content-type: application/json
        // it is required to add ".allow_headers([http::header::CONTENT_TYPE])"
        // or see this issue https://github.com/tokio-rs/axum/issues/849
        CorsLayer::new()
            .allow_origin("http://localhost:3000".parse::<HeaderValue>().unwrap())
            .allow_methods([Method::GET]),
    );
    let port = env::var("PORT")
        .unwrap_or("8000".to_string())
        .parse::<u16>()
        .unwrap();
    println!("API server is running on port {}", port);
    serve(app, port).await;
}

async fn serve(app: Router, port: u16) {
    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn json() -> impl IntoResponse {
    Json(vec!["one", "two", "three"])
}
