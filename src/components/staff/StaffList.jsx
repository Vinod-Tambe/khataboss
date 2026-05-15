import React from 'react'
import List from '../common/List'

const StaffList = () => {
  const userData = [
    { id: 1, name: "John Doe", position: "Manager", office: "New York", status: "Active", salary: "$90,000", createdAt: "2026-01-05" },
    { id: 2, name: "Anna Smith", position: "Developer", office: "London", status: "Pending", salary: "$75,000", createdAt: "2026-01-05" },
    { id: 3, name: "Michael Brown", position: "Designer", office: "San Francisco", status: "Inactive", salary: "$65,000", createdAt: "2026-01-05" },
    { id: 4, name: "Emily Davis", position: "Analyst", office: "Chicago", status: "Active", salary: "$80,000", createdAt: "2026-01-10" },
    { id: 5, name: "David Wilson", position: "Engineer", office: "Seattle", status: "Pending", salary: "$85,000", createdAt: "2026-01-15" },
    { id: 6, name: "Sarah Johnson", position: "Consultant", office: "Boston", status: "Active", salary: "$95,000", createdAt: "2026-01-20" },
    { id: 7, name: "Robert Lee", position: "Director", office: "Los Angeles", status: "Inactive", salary: "$120,000", createdAt: "2026-01-25" },
    { id: 8, name: "Lisa Garcia", position: "Specialist", office: "Miami", status: "Active", salary: "$70,000", createdAt: "2026-01-30" },
    { id: 9, name: "James Martinez", position: "Coordinator", office: "Denver", status: "Pending", salary: "$60,000", createdAt: "2026-02-05" },
    { id: 10, name: "Maria Rodriguez", position: "Supervisor", office: "Phoenix", status: "Active", salary: "$100,000", createdAt: "2026-02-10" },
    { id: 11, name: "William Anderson", position: "Technician", office: "Portland", status: "Inactive", salary: "$55,000", createdAt: "2026-02-15" },
    { id: 12, name: "Jennifer Taylor", position: "Manager", office: "Austin", status: "Active", salary: "$90,000", createdAt: "2026-02-20" },
    { id: 13, name: "Christopher Thomas", position: "Developer", office: "Raleigh", status: "Pending", salary: "$75,000", createdAt: "2026-02-25" },
    { id: 14, name: "Amanda Jackson", position: "Designer", office: "Nashville", status: "Active", salary: "$65,000", createdAt: "2026-03-01" },
    { id: 15, name: "Matthew White", position: "Analyst", office: "Salt Lake City", status: "Inactive", salary: "$80,000", createdAt: "2026-03-05" },
    { id: 16, name: "Ashley Harris", position: "Engineer", office: "Orlando", status: "Active", salary: "$85,000", createdAt: "2026-03-10" },
    { id: 17, name: "Daniel Martin", position: "Consultant", office: "Minneapolis", status: "Pending", salary: "$95,000", createdAt: "2026-03-15" },
    { id: 18, name: "Jessica Thompson", position: "Director", office: "Tampa", status: "Active", salary: "$120,000", createdAt: "2026-03-20" },
    { id: 19, name: "Anthony Garcia", position: "Specialist", office: "Pittsburgh", status: "Inactive", salary: "$70,000", createdAt: "2026-03-25" },
    { id: 20, name: "Harper King", position: "Finance Analyst", office: "Dubai", status: "Active", salary: "$90,000", createdAt: "2026-03-30" },
  ];

  const columns = [
    { key: "id", title: "ID", orderable: true, searchable: true },
    { key: "name", title: "Name", orderable: true, searchable: true },
    { key: "position", title: "Position", orderable: true, searchable: true },
    { key: "office", title: "Office", orderable: true, searchable: true },
    { key: "status", title: "Status", orderable: true, searchable: true },
    { key: "salary", title: "Salary", orderable: true, searchable: true },
    { key: "createdAt", title: "Date", orderable: true, searchable: true, dateFilter: true },
  ];

  const handleEdit = (rowData) => {
    alert(`Edit user: ${rowData.name} (ID: ${rowData.id})`);
  };

  const handleDelete = (rowData) => {
    alert(`User ${rowData.name} deleted (mock)`);
  };

  const handlePrint = (rowData) => {
    // Replace with your custom invoice print logic
    alert(`Print invoice for user: ${rowData.name} (ID: ${rowData.id})`);
  };

  return (
    <div>
      <List
        data={userData}
        columns={columns}
        title="All Staff List"
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPrint={handlePrint}
        hasEdit={true}
        hasDelete={true}
        hasPrint={true}
        deleteConfirmMessage={(row) => `Are you sure you want to delete user: ${row?.name} (ID: ${row?.id})?`}
      />
    </div>
  )
}

export default StaffList
