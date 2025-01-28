-- name: AddContact :one
insert into contact (id, email, phone_number)
values (?, ?, ?)
returning *;

-- name: GetContactById :one
select * from contact where id = ?;

-- name: GetContacts :many
select * from contact
order by created_at
limit ? offset ?;

-- name: UpdateContact :exec
update contact
set email = ?, phone_number = ?
where id = ?;

-- name: DeleteContact :exec
delete from contact where id = ?;
