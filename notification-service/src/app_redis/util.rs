use r2d2::Pool;
use r2d2_redis::redis::Commands;
use r2d2_redis::RedisConnectionManager;

pub fn cache_message_id(
    redis_pool: &Pool<RedisConnectionManager>,
    cache_key: &str,
    message_id: &str,
) {
    let mut redis_conn = match redis_pool.get() {
        Ok(conn) => conn,
        Err(err) => {
            eprintln!(
                "Error while getting redis connection from the pool: {}",
                err
            );
            return;
        }
    };

    if let Err(err) =
        redis_conn.rpush::<String, String, ()>(cache_key.to_string(), message_id.to_string())
    {
        eprintln!("Error adding message ID to redis cache: {}", err);
    }
}

pub fn pop_message_id(
    redis_pool: &Pool<RedisConnectionManager>,
    cache_key: &str,
    message_id: &str,
) -> bool {
    let mut redis_conn = match redis_pool.get() {
        Ok(conn) => conn,
        Err(err) => {
            eprintln!(
                "Error while getting redis connection from the pool: {}",
                err
            );
            return false;
        }
    };

    if let Ok(removed_count) = redis_conn.lrem::<_, _, isize>(cache_key, 1, message_id) {
        if removed_count > 0 {
            return true;
        }
    };

    false
}
