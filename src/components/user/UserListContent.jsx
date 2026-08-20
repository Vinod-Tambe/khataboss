import React from "react";
import List from "../common/List";

const UserListContent = ({
  userData = [],
  columns = [],
  loading = false,
  hasEdit = false,
  hasDelete = false,
  hasView = true,
  hasPrint = false,
  onView,
  onEdit,
  onDelete,
}) => (
  <List
    data={userData}
    columns={columns}
    title="All Customer List"
    primaryKey="user_first_name"
    subtitleKey="user_add_date"
    onEdit={hasEdit ? onEdit : undefined}
    onDelete={hasDelete ? onDelete : undefined}
    onPrint={hasPrint ? () => window.print() : undefined}
    onView={hasView ? onView : undefined}
    hasEdit={hasEdit}
    hasDelete={hasDelete}
    hasPrint={hasPrint}
    hasView={hasView}
    loading={loading}
    deleteConfirmMessage={(row) =>
      `Are you sure you want to delete customer: ${row?.user_first_name} ${row?.user_last_name}?`
    }
  />
);

export default UserListContent;
