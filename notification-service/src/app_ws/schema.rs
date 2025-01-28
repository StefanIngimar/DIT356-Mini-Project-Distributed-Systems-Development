use serde::Serialize;

#[derive(Serialize, Clone)]
pub struct WsPayload<T: Serialize> {
    pub event: String,
    pub data: T,
}
