// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: dentist.sql

package db

import (
	"context"
	"database/sql"
	"time"
)

const addDentist = `-- name: AddDentist :one
insert into dentist (id, user_id, first_name, last_name, specialization, years_of_experiance, contact_id)
values (?, ?, ?, ?, ?, ?, ?)
returning id, created_at, updated_at, first_name, last_name, specialization, years_of_experiance, image_url, user_id, contact_id
`

type AddDentistParams struct {
	ID                interface{}
	UserID            interface{}
	FirstName         string
	LastName          string
	Specialization    sql.NullString
	YearsOfExperiance sql.NullInt64
	ContactID         interface{}
}

func (q *Queries) AddDentist(ctx context.Context, arg AddDentistParams) (Dentist, error) {
	row := q.db.QueryRowContext(ctx, addDentist,
		arg.ID,
		arg.UserID,
		arg.FirstName,
		arg.LastName,
		arg.Specialization,
		arg.YearsOfExperiance,
		arg.ContactID,
	)
	var i Dentist
	err := row.Scan(
		&i.ID,
		&i.CreatedAt,
		&i.UpdatedAt,
		&i.FirstName,
		&i.LastName,
		&i.Specialization,
		&i.YearsOfExperiance,
		&i.ImageUrl,
		&i.UserID,
		&i.ContactID,
	)
	return i, err
}

const deleteDentist = `-- name: DeleteDentist :exec
delete from dentist where id = ?
`

func (q *Queries) DeleteDentist(ctx context.Context, id interface{}) error {
	_, err := q.db.ExecContext(ctx, deleteDentist, id)
	return err
}

const getDentistById = `-- name: GetDentistById :one
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
where dentist.id = ?
`

type GetDentistByIdRow struct {
	ID                 interface{}
	UserID             interface{}
	CreatedAt          time.Time
	UpdatedAt          time.Time
	FirstName          string
	LastName           string
	ImageUrl           string
	Specialization     sql.NullString
	YearsOfExperiance  sql.NullInt64
	ContactID          interface{}
	ContactCreatedAt   sql.NullTime
	ContactUpdatedAt   sql.NullTime
	ContactEmail       sql.NullString
	ContactPhoneNumber sql.NullString
}

func (q *Queries) GetDentistById(ctx context.Context, id interface{}) (GetDentistByIdRow, error) {
	row := q.db.QueryRowContext(ctx, getDentistById, id)
	var i GetDentistByIdRow
	err := row.Scan(
		&i.ID,
		&i.UserID,
		&i.CreatedAt,
		&i.UpdatedAt,
		&i.FirstName,
		&i.LastName,
		&i.ImageUrl,
		&i.Specialization,
		&i.YearsOfExperiance,
		&i.ContactID,
		&i.ContactCreatedAt,
		&i.ContactUpdatedAt,
		&i.ContactEmail,
		&i.ContactPhoneNumber,
	)
	return i, err
}

const getDentistByUserId = `-- name: GetDentistByUserId :one
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
where dentist.user_id = ?
`

type GetDentistByUserIdRow struct {
	ID                 interface{}
	UserID             interface{}
	CreatedAt          time.Time
	UpdatedAt          time.Time
	FirstName          string
	LastName           string
	ImageUrl           string
	Specialization     sql.NullString
	YearsOfExperiance  sql.NullInt64
	ContactID          interface{}
	ContactCreatedAt   sql.NullTime
	ContactUpdatedAt   sql.NullTime
	ContactEmail       sql.NullString
	ContactPhoneNumber sql.NullString
}

func (q *Queries) GetDentistByUserId(ctx context.Context, userID interface{}) (GetDentistByUserIdRow, error) {
	row := q.db.QueryRowContext(ctx, getDentistByUserId, userID)
	var i GetDentistByUserIdRow
	err := row.Scan(
		&i.ID,
		&i.UserID,
		&i.CreatedAt,
		&i.UpdatedAt,
		&i.FirstName,
		&i.LastName,
		&i.ImageUrl,
		&i.Specialization,
		&i.YearsOfExperiance,
		&i.ContactID,
		&i.ContactCreatedAt,
		&i.ContactUpdatedAt,
		&i.ContactEmail,
		&i.ContactPhoneNumber,
	)
	return i, err
}

const getDentists = `-- name: GetDentists :many
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
limit ? offset ?
`

type GetDentistsParams struct {
	Limit  int64
	Offset int64
}

type GetDentistsRow struct {
	ID                 interface{}
	UserID             interface{}
	CreatedAt          time.Time
	UpdatedAt          time.Time
	FirstName          string
	LastName           string
	ImageUrl           string
	Specialization     sql.NullString
	YearsOfExperiance  sql.NullInt64
	ContactID          interface{}
	ContactCreatedAt   sql.NullTime
	ContactUpdatedAt   sql.NullTime
	ContactEmail       sql.NullString
	ContactPhoneNumber sql.NullString
}

func (q *Queries) GetDentists(ctx context.Context, arg GetDentistsParams) ([]GetDentistsRow, error) {
	rows, err := q.db.QueryContext(ctx, getDentists, arg.Limit, arg.Offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []GetDentistsRow
	for rows.Next() {
		var i GetDentistsRow
		if err := rows.Scan(
			&i.ID,
			&i.UserID,
			&i.CreatedAt,
			&i.UpdatedAt,
			&i.FirstName,
			&i.LastName,
			&i.ImageUrl,
			&i.Specialization,
			&i.YearsOfExperiance,
			&i.ContactID,
			&i.ContactCreatedAt,
			&i.ContactUpdatedAt,
			&i.ContactEmail,
			&i.ContactPhoneNumber,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const updateDentist = `-- name: UpdateDentist :exec
update dentist
set first_name = ?, last_name = ?, specialization = ?, years_of_experiance = ?
where id = ?
`

type UpdateDentistParams struct {
	FirstName         string
	LastName          string
	Specialization    sql.NullString
	YearsOfExperiance sql.NullInt64
	ID                interface{}
}

func (q *Queries) UpdateDentist(ctx context.Context, arg UpdateDentistParams) error {
	_, err := q.db.ExecContext(ctx, updateDentist,
		arg.FirstName,
		arg.LastName,
		arg.Specialization,
		arg.YearsOfExperiance,
		arg.ID,
	)
	return err
}
