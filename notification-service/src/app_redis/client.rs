use r2d2::Pool;
use r2d2_redis::RedisConnectionManager;

pub fn _connect(
    redis_hostname: &str,
    redis_password: &str,
) -> Result<redis::Connection, redis::RedisError> {
    let conn_url = format!("redis://:{}@{}", redis_password, redis_hostname);

    let client = match redis::Client::open(conn_url) {
        Ok(c) => c,
        Err(err) => return Err(err),
    };

    client.get_connection()
}

pub fn create_connection_pool(
    redis_hostname: &str,
    redis_password: &str,
) -> Pool<RedisConnectionManager> {
    let conn_url = format!("redis://:{}@{}", redis_password, redis_hostname);
    let manager = RedisConnectionManager::new(conn_url).unwrap();
    Pool::builder().build(manager).unwrap()
}
