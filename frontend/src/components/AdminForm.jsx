import React from 'react';

const AdminForm = ({ form, onDelete }) => {
  return (
    <tr>
      <td>{form.name}</td>
      <td>{form.createdAt}</td>
      <td>
        <button onClick={() => onDelete(form.id)}>Delete</button>
      </td>
    </tr>
  );
};

export default AdminForm;
