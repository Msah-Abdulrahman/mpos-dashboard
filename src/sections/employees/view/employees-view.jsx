import { useState } from 'react';
import { doc, setDoc, collection } from 'firebase/firestore';
import { ref, getStorage, uploadBytes, getDownloadURL } from 'firebase/storage';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { Dialog, TextField, DialogTitle, DialogActions, DialogContent } from '@mui/material';

import { users } from 'src/_mock/user';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import TableNoData from '../table-no-data';
import UserTableRow from '../user-table-row';
import UserTableHead from '../user-table-head';
import { db } from '../../../firebase/firebase';
import TableEmptyRows from '../table-empty-rows';
import UserTableToolbar from '../user-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';


export default function EmployeesView() {

  const [employeeName, setEmployeeName] = useState('');
  const [dateEmployed, setDateEmployed] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePath, setImagePath] = useState(''); // Store the uploaded image URL



  const handleInputChange = (event, setter) => {
    setter(event.target.value);
  };

  const handleSubmit = async () => {
    try {
      const docRef = doc(collection(db, 'employees'));

      uploadImage();
      await setDoc(docRef, {
        name: employeeName,
        dateEmployed,
        imageURL: imagePath
      });

      console.log('Employee added with ID:', docRef.id);
      handleCloseAddEmployeeDialog()
    } catch (error) {
      console.error('Error adding employee:', error);
      // Handle errors appropriately, e.g., display user-friendly messages
    }
  };









  const [openAddEmployeeDialog, setOpenAddEmployeeDialog] = useState(false);
  
  const handleAddEmployeeClick = () => {
    setOpenAddEmployeeDialog(true);
  };

  const handleCloseAddEmployeeDialog = () => {
    setOpenAddEmployeeDialog(false);
  };



  const handleImageChange = (event) => {
    const selectedFile = event.target.files[0];

    if (!selectedFile) {
      return;
    }

    setSelectedImage(selectedFile);
  };

  const uploadImage = async () => {
    if (!selectedImage) {
      return; // Handle missing image
    }

    const storage = getStorage(); // Initialize Firebase Storage

    const storageRef = ref(storage, `employees/${selectedImage.name}`);

    try {
      await uploadBytes(storageRef, selectedImage);
      const downloadURL = await getDownloadURL(storageRef);
      setImagePath(downloadURL);
    } catch (error) {
      console.error('Error uploading image:', error);
      // Handle errors appropriately, e.g., display user-friendly messages
    }
  };


















  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';
    if (id !== '') {
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = users.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const dataFiltered = applyFilter({
    inputData: users,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Employees</Typography>

        <Button variant="contained" color="inherit"  onClick={handleAddEmployeeClick} startIcon={<Iconify icon="eva:plus-fill" />}>
          New employee
        </Button>
      </Stack>

      <Card>
        <UserTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <UserTableHead
                order={order}
                orderBy={orderBy}
                rowCount={users.length}
                numSelected={selected.length}
                onRequestSort={handleSort}
                onSelectAllClick={handleSelectAllClick}
                headLabel={[
                  { id: 'name', label: 'Name' },
                  { id: 'email', label: 'Email' },
                  { id: 'orders', label: 'Orders' },
                  { id: 'date_employed', label: 'Employment date', align: 'center' },
                  { id: 'status', label: 'Status' },
                  { id: '' },
                ]}
              />
              <TableBody>
                {dataFiltered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <UserTableRow
                      key={row.id}
                      name={row.name}
                      role={row.role}
                      status={row.status}
                      company={row.company}
                      avatarUrl={row.avatarUrl}
                      isVerified={row.isVerified}
                      selected={selected.indexOf(row.name) !== -1}
                      handleClick={(event) => handleClick(event, row.name)}
                    />
                  ))}

                <TableEmptyRows
                  height={77}
                  emptyRows={emptyRows(page, rowsPerPage, users.length)}
                />

                {notFound && <TableNoData query={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          page={page}
          component="div"
          count={users.length}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>





      <Dialog
        open={openAddEmployeeDialog}
        onClose={handleCloseAddEmployeeDialog}
        aria-labelledby="add-product-dialog-title">
        <DialogTitle id="add-product-dialog-title">Add Emlopyee</DialogTitle>
        <DialogContent>
          <TextField
            label="Employee Name"
            fullWidth
            margin="normal"
            value={employeeName}
            onChange={(event) => handleInputChange(event, setEmployeeName)}
            required
          />

          <TextField
            label="Date Employed"
            type="number" // Ensure numerical input
            fullWidth
            margin="normal"
            value={dateEmployed}
            onChange={(event) => handleInputChange(event, setDateEmployed)}
            required
          />

          <TextField
            label="Employee Photo"
            type="file" // File input for image selection
            fullWidth
            margin="normal"
            onChange={handleImageChange}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddEmployeeDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary" disabled={!employeeName || !dateEmployed}>
            Add Employee
          </Button>
        </DialogActions>
      </Dialog>






    </Container>
  );
}
