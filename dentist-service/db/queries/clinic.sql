-- name: AddClinic :one
insert into clinic (id, name, description, address_id, contact_id)
values (?, ?, ?, ?, ?)
returning *;

-- name: GetClinicById :one
select
    clinic.ID as id,
    clinic.created_at as created_at,
    clinic.updated_at as updated_at,
    clinic.name as name,
    clinic.description as description,
    clinic.logo_url as logo_url,

    contact.id as contact_id,
    contact.created_at as contact_created_at,
    contact.updated_at as contact_updated_at,
    contact.email as contact_email,
    contact.phone_number as contact_phone_number,

    address.id as address_id,
    address.created_at as address_created_at,
    address.updated_at as address_updated_at,
    address.street as street,
    address.city as city,
    address.postal_Code as postal_code,
    address.country as country,
    address.latitude as latitude,
    address.longitude as longitude
from clinic
left join address on clinic.address_id = address.id
left join contact on clinic.contact_id = contact.id
where clinic.id = ?;

-- name: GetClinics :many
select
    clinic.ID as id,
    clinic.created_at as created_at,
    clinic.updated_at as updated_at,
    clinic.name as name,
    clinic.description as description,
    clinic.logo_url as logo_url,

    contact.id as contact_id,
    contact.created_at as contact_created_at,
    contact.updated_at as contact_updated_at,
    contact.email as contact_email,
    contact.phone_number as contact_phone_number,

    address.id as address_id,
    address.created_at as address_created_at,
    address.updated_at as address_updated_at,
    address.street as street,
    address.city as city,
    address.postal_Code as postal_code,
    address.country as country,
    address.latitude as latitude,
    address.longitude as longitude
from clinic
left join address on clinic.address_id = address.id
left join contact on clinic.contact_id = contact.id
order by clinic.created_at
limit ? offset ?;

-- name: UpdateClinic :exec
update clinic
set name = ?, description = ?
where id = ?;

-- name: DeleteClinic :exec
delete from clinic where id = ?;
