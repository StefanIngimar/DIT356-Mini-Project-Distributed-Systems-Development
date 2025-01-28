-- name: AddAddress :one
insert into address (id, street, city, postal_code, country, latitude, longitude)
values (?, ?, ?, ?, ?, ?, ?)
returning *;

-- name: GetAddressById :one
select * from address where id = ?;

-- name: GetAddresses :many
select * from address
order by created_at
limit ? offset ?;

-- name: UpdateAddress :exec
update address
set street = ?, city = ?, postal_code = ?, country = ?, latitude = ?, longitude = ?
where id = ?;

-- name: DeleteAddress :exec
delete from address where id = ?;
