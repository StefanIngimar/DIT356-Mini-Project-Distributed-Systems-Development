-- name: AddClinicDentist :one
insert into clinic_dentist (clinic_id, dentist_id)
values (?, ?)
returning *;

-- name: GetDentistsForClinic :many
select 
    dentist.ID as id,
    dentist.user_id as user_id,
    dentist.first_name as first_name,
    dentist.last_name as last_name,
    dentist.image_url as image_url,
    dentist.specialization as specialization,
    dentist.years_of_experiance as years_of_experiance,
    contact.id as contact_id,
    contact.email as contact_email,
    contact.phone_number as contact_phone_number
from clinic_dentist
join dentist on dentist.id = clinic_dentist.dentist_id
join contact on dentist.contact_id = contact.id
where clinic_dentist.clinic_id = ?;

-- name: GetClinicsAssociatedWithDentist :many
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
from clinic_dentist
join clinic on clinic.id = clinic_dentist.clinic_id
join address on address.id = clinic.address_id
join contact on contact.id = clinic.contact_id
where clinic_dentist.dentist_id = ?;
