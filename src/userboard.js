import React, { useState, useEffect } from 'react';
import './userboard.css';

const UserDashboard = () => {
  const [users, setUsers] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [nameFilter, setNameFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [roleFilters, setRoleFilters] = useState([]);
  const [editingRowId, setEditingRowId] = useState(null);

  const pageSize = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          'https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json'
        );
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

 

  const filteredUsers = users
  .filter(user =>
    user.name.toLowerCase().includes(nameFilter.toLowerCase()) &&
    user.email.toLowerCase().includes(emailFilter.toLowerCase()) &&
    (roleFilters.length === 0 || roleFilters.includes(user.role.toLowerCase()))
  )
  .sort((a, b) => a.id - b.id);

  const handleRoleFilter = role => {
    const updatedRoleFilters = [...roleFilters];
    const index = updatedRoleFilters.indexOf(role);

    if (index === -1) {
      updatedRoleFilters.push(role);
    } else {
      updatedRoleFilters.splice(index, 1);
    }

    setRoleFilters(updatedRoleFilters);
  };

  
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

 
  const handleClearFilters = () => {
    setNameFilter('');
    setEmailFilter('');
    setRoleFilters([]);
    setCurrentPage(1);
  };

  
  const handleSelectAll = () => {
    const allUserIds = filteredUsers.map(user => user.id);
    setSelectedRows(selectedRows.length === allUserIds.length ? [] : allUserIds);
  };

  const handleSelectRow = id => {
    const newSelectedRows = [...selectedRows];
    const index = newSelectedRows.indexOf(id);

    if (index === -1) {
      newSelectedRows.push(id);
    } else {
      newSelectedRows.splice(index, 1);
    }

    setSelectedRows(newSelectedRows);
  };

  
  const handlePageChange = newPage => {
    setCurrentPage(newPage);
  };

  
  const handleDeleteSelected = () => {
    const isConfirmed = window.confirm('Do you want to delete the selected rows?');

    if (isConfirmed) {
      const updatedUsers = users.filter(user => !selectedRows.includes(user.id));
      setUsers(updatedUsers);
      setSelectedRows([]);
    }
  };

  const handleDeleteSingle = (id, name) => {
    const isConfirmed = window.confirm(`Do you want to delete the user "${name}"?`);

    if (isConfirmed) {
      const updatedUsers = users.filter(user => user.id !== id);
      setUsers(updatedUsers);
      setSelectedRows([]);
    }
  };

  
  const handleEdit = id => {
    setEditingRowId(id === editingRowId ? null : id);
  };

  
  const handleSave = id => {
    const updatedUsers = users.map(user =>
      user.id === id
        ? {
          ...user,
          name: document.getElementById(`editName${id}`).value,
          email: document.getElementById(`editEmail${id}`).value,
          role: document.getElementById(`editRole${id}`).value,
        }
        : user
    );
    setUsers(updatedUsers);
    setEditingRowId(null);
  };
  useEffect(() => {
    const validateCurrentPage = () => {
      const lastPage = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
      setCurrentPage(Math.min(currentPage, lastPage));
    };
  
    validateCurrentPage();
  }, [filteredUsers, pageSize, currentPage]);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-heading">DashBoard</h1>
      <div>
        <div className='searchbox'>
          <input 
            type="text"
            id="nameFilter"
            placeholder="Filter by Name"
            value={nameFilter}
            onChange={e => setNameFilter(e.target.value)}
          />
          <input
            type="text"
            id="emailFilter"
            placeholder="Filter by Email"
            value={emailFilter}
            onChange={e => setEmailFilter(e.target.value)}
          />

          <div className="filter">
            <span >Filter by Role: &nbsp;</span>
            <div className='filter-checkboxes'>
            <input
                type="checkbox"
                id="adminCheckbox"
                checked={roleFilters.includes('admin')}
                onChange={() => handleRoleFilter('admin')}
              />
              <label htmlFor="adminCheckbox">Admin</label>

              <input
                type="checkbox"
                id="memberCheckbox"
                checked={roleFilters.includes('member')}
                onChange={() => handleRoleFilter('member')}
              />
              <label htmlFor="memberCheckbox">Member</label>
              </div>
          </div>

          <button className="clear-filters-btn" onClick={handleClearFilters}>
            Clear Filters
          </button>

          <button className="delete-all-btn" onClick={handleDeleteSelected}>
            <i className="fa-regular fa-trash-can"></i>
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={() => handleSelectAll()}
                  checked={selectedRows.length === filteredUsers.length}
                  disabled={filteredUsers.length === 0}
                />
              </th>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map(user => (
              <tr
                key={user.id}
                className={`${
                  selectedRows.includes(user.id) ? 'selected-row' : ''
                } ${editingRowId === user.id ? 'editing-row' : ''}`}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(user.id)}
                    onChange={() => handleSelectRow(user.id)}
                  />
                </td>
                <td>{user.id}</td>
                <td>
                  {editingRowId === user.id ? (
                    <input
                      type="text"
                      id={`editName${user.id}`}
                      defaultValue={user.name}
                    />
                  ) : (
                    user.name
                  )}
                </td>
                <td>
                  {editingRowId === user.id ? (
                    <input
                      type="text"
                      id={`editEmail${user.id}`}
                      defaultValue={user.email}
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td>
                  {editingRowId === user.id ? (
                    <input
                      type="text"
                      id={`editRole${user.id}`}
                      defaultValue={user.role}
                    />
                  ) : (
                    user.role
                  )}
                </td>
                <td>
                  {editingRowId === user.id ? (
                    <button className="save" onClick={() => handleSave(user.id)}>
                      <i className="fa-solid fa-check"></i>
                    </button>
                  ) : (
                    <button className="edit" onClick={() => handleEdit(user.id)}>
                      <i className="fas fa-edit"></i>
                    </button>
                  )}
                  <button className="delete-btn" onClick={() => handleDeleteSingle(user.id, user.name)}>
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className='pagination'>
          <button className='page-button'
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            <i className="fa-solid fa-angles-left"></i>
          </button>
          <button className='page-button'
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <i className="fa-solid fa-angle-left"></i>
          </button>
          <span className='PageNumber'>Page {currentPage}</span>
          <button className='page-button'
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === Math.ceil(filteredUsers.length / pageSize)}
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
          <button className='page-button'
            onClick={() =>
              handlePageChange(Math.ceil(filteredUsers.length / pageSize))
            }
            disabled={
              currentPage === Math.ceil(filteredUsers.length / pageSize)
            }
          >
            <i className="fa-solid fa-angles-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;