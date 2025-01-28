-- name: AddDentist :one
insert into dentist (id, user_id, first_name, last_name, specialization, years_of_experiance, contact_id)
values (?, ?, ?, ?, ?, ?, ?)
returning *;

-- name: GetDentistById :one
select
    dentist.ID as id,
    dentist.user_id as user_id,
    dentist.created_at as created_at,
    dentist.updated_at as updated_at,
    dentist.first_name as first_name,
    dentist.last_name as last_name,
    dentist.image_url as image_url,
    dentist.specialization as specialization,
    dentist.years_of_experiance as years_of_experiance,

    contact.id as contact_id,
    contact.created_at as contact_created_at,
    contact.updated_at as contact_updated_at,
    contact.email as contact_email,
    contact.phone_number as contact_phone_number
from dentist
left join contact on dentist.contact_id = contact.id
where dentist.id = ?;

-- name: GetDentistByUserId :one
select
    dentist.ID as id,
    dentist.user_id as user_id,
    dentist.created_at as created_at,
    dentist.updated_at as updated_at,
    dentist.first_name as first_name,
    dentist.last_name as last_name,
    dentist.image_url as image_url,
    dentist.specialization as specialization,
    dentist.years_of_experiance as years_of_experiance,

    contact.id as contact_id,
    contact.created_at as contact_created_at,
    contact.updated_at as contact_updated_at,
    contact.email as contact_email,
    contact.phone_number as contact_phone_number
from dentist
left join contact on dentist.contact_id = contact.id
where dentist.user_id = ?;

-- name: GetDentists :many
select
    dentist.ID as id,
    dentist.user_id as user_id,
    dentist.created_at as created_at,
    dentist.updated_at as updated_at,
    dentist.first_name as first_name,
    dentist.last_name as last_name,
    dentist.image_url as image_url,
    dentist.specialization as specialization,
    dentist.years_of_experiance as years_of_experiance,

    contact.id as contact_id,
    contact.created_at as contact_created_at,
    contact.updated_at as contact_updated_at,
    contact.email as contact_email,
    contact.phone_number as contact_phone_number
from dentist 
left join contact on dentist.contact_id = contact.id
order by dentist.created_at
limit ? offset ?;

-- name: UpdateDentist :exec
update dentist
set first_name = ?, last_name = ?, specialization = ?, years_of_experiance = ?
where id = ?;

-- name: DeleteDentist :exec
delete from dentist where id = ?;
