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
  <div className="customer-browse-list">
  <List
    data={userData}
    columns={columns}
    title="All Customer List"
    primaryKey="user_unique_code"
    subtitleKey="user_mobile_no"
    onEdit={hasEdit ? onEdit : undefined}
    onDelete={hasDelete ? onDelete : undefined}
    onPrint={hasPrint ? () => window.print() : undefined}
    onView={hasView ? onView : undefined}
    hasEdit={hasEdit}
    hasDelete={hasDelete}
    hasPrint={hasPrint}
    hasView={hasView}
    isLoading={loading}
    showFooter={false}
    applyDefaultDateFilter={false}
    deleteConfirmMessage={(row) =>
      `Delete customer "${row?.user_first_name} ${row?.user_last_name}"?\n\nAll loans, finance records, payments, deposits, releases, and related journal entries will also be deleted.`
    }
  />
  </div>
);

export default UserListContent;
