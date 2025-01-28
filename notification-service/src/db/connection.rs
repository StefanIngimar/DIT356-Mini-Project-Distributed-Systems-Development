use diesel::prelude::*;

use diesel::r2d2::{ConnectionManager, Pool};
use diesel::sqlite::SqliteConnection;

pub type DbPool = Pool<ConnectionManager<SqliteConnection>>;

#[allow(dead_code)]
pub fn connect(db_url: &str) -> SqliteConnection {
    match SqliteConnection::establish(db_url) {
        Ok(con) => con,
        Err(err) => {
            let msg = format!(
                "Cannot connect to the database at URL: '{}', error: {}",
                db_url, err
            );
            panic!("{}", msg);
        }
    }
}

pub fn establish_connection_pool(db_url: &str) -> DbPool {
    let manager = ConnectionManager::<SqliteConnection>::new(db_url);

    Pool::builder()
        .build(manager)
        .expect("Failed to create db pool")
}
