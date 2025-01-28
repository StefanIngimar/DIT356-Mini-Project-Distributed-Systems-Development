-- +goose Up

create table address (
    id         UUID primary key,
    created_at timestamp not null default CURRENT_TIMESTAMP,
    updated_at timestamp not null default CURRENT_TIMESTAMP,

    street      text not null,
    city        text not null,
    postal_code text not null,
    country     text not null,
    latitude    double precision,
    longitude   double precision
);


create table contact (
    id         UUID primary key,
    created_at timestamp not null default CURRENT_TIMESTAMP,
    updated_at timestamp not null default CURRENT_TIMESTAMP,

    email        text,
    phone_number text
);


create table clinic (
    id         UUID primary key,
    created_at timestamp not null default CURRENT_TIMESTAMP,
    updated_at timestamp not null default CURRENT_TIMESTAMP,

    name           text not null,
    description    text,
    logo_url       text not null default 'https://static.vecteezy.com/system/resources/thumbnails/005/495/317/small_2x/dental-clinic-logo-template-dental-care-logo-designs-tooth-teeth-smile-dentist-logo-vector.jpg',

    -- one-to-one
    address_id UUID unique references address(id),
    contact_id UUID unique references contact(id)
);


create table dentist (
    id         UUID primary key,
    created_at timestamp not null default CURRENT_TIMESTAMP,
    updated_at timestamp not null default CURRENT_TIMESTAMP,
    
    first_name          text not null,
    last_name           text not null,
    specialization      text,
    years_of_experiance int,
    image_url           text not null default 'https://images.vexels.com/media/users/3/151709/isolated/preview/098c4aad185294e67a3f695b3e64a2ec-doctor-avatar-icon.png?w=360',
    
    -- references user from the other service
    user_id UUID unique not null,

    -- one-to-one
    contact_id UUID unique references contact(id)
);


create table clinic_dentist (
    created_at timestamp not null default CURRENT_TIMESTAMP,
    updated_at timestamp not null default CURRENT_TIMESTAMP,
    
    -- many-to-many
    clinic_id  UUID not null references clinic(id) on delete cascade,
    dentist_id UUID not null references dentist(id) on delete cascade,

    primary key (clinic_id, dentist_id)
);


-- +goose Down

drop table address;
drop table contact;
drop table clinic;
drop table dentist;
drop table clinic_dentist;
