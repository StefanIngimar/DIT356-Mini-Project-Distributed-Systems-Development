"""Sync migrations with current schema

Revision ID: 62e1ea4cf749
Revises: d29074784795
Create Date: 2024-11-29 17:22:49.187603

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '62e1ea4cf749'
down_revision: Union[str, None] = 'd29074784795'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('clinics')
    op.drop_table('availability')
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('availability',
    sa.Column('id', sa.VARCHAR(), nullable=False),
    sa.Column('dentist_id', sa.VARCHAR(), nullable=False),
    sa.Column('clinic_id', sa.VARCHAR(), nullable=False),
    sa.Column('day_of_week', sa.VARCHAR(), nullable=False),
    sa.Column('start_time', sa.VARCHAR(), nullable=False),
    sa.Column('end_time', sa.VARCHAR(), nullable=False),
    sa.Column('status', sa.VARCHAR(), nullable=False),
    sa.Column('created_at', sa.DATETIME(), nullable=False),
    sa.Column('updated_at', sa.DATETIME(), nullable=False),
    sa.ForeignKeyConstraint(['clinic_id'], ['clinics.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('clinics',
    sa.Column('id', sa.INTEGER(), nullable=False),
    sa.Column('name', sa.VARCHAR(), nullable=False),
    sa.Column('description', sa.VARCHAR(), nullable=True),
    sa.Column('street', sa.VARCHAR(), nullable=False),
    sa.Column('city', sa.VARCHAR(), nullable=False),
    sa.Column('postal_code', sa.VARCHAR(), nullable=False),
    sa.Column('country', sa.VARCHAR(), nullable=False),
    sa.Column('latitude', sa.VARCHAR(), nullable=True),
    sa.Column('longitude', sa.VARCHAR(), nullable=True),
    sa.Column('email', sa.VARCHAR(), nullable=True),
    sa.Column('phone_number', sa.VARCHAR(), nullable=True),
    sa.Column('created_at', sa.DATETIME(), nullable=False),
    sa.Column('updated_at', sa.DATETIME(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###
