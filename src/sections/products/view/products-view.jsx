import { useState, useEffect } from 'react';
import { doc, setDoc, getDocs, collection } from 'firebase/firestore';
import {ref, getStorage, uploadBytes, getDownloadURL } from 'firebase/storage';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import {
  Button,
  Dialog,
  TextField,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import TableNoData from '../table-no-data';
import UserTableRow from '../user-table-row';
import UserTableHead from '../user-table-head';
import { db } from '../../../firebase/firebase';
import TableEmptyRows from '../table-empty-rows';
import UserTableToolbar from '../user-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';




export default function ProductsView() {
  const [productName, setProductName] = useState('');
  const [productCode, setProductCode] = useState('');
  const [productQuantity, setProductQuantity] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);



  const handleInputChange = (event, setter) => {
    setter(event.target.value);
  };

  const handleSubmit = async () => {
    try {
      if (!selectedImage) {
        alert("Please select an image")
        return; // Handle missing image
      }
      const docRef = doc(collection(db, 'products'), productCode.toLowerCase()); // Use product name (lowercase) as custom ID
      const storage = getStorage(); // Initialize Firebase Storage
      const storageRef = ref(storage, `products/${selectedImage.name}`); // Create a reference with product name
      await uploadBytes(storageRef, selectedImage);
      const downloadURL = await getDownloadURL(storageRef);


      await setDoc(docRef, {
        id: productCode,
        name: productName,
        quantity: Number(productQuantity), // Ensure productQuantity is a number
        description: productDescription,
        price: Number(productPrice), // Ensure productPrice is a number
        imageURL: downloadURL
        // Add any other product properties if needed
      });

      console.log('Product added with ID:', docRef.id);
      handleCloseAddProductDialog()
    } catch (error) {
      console.error('Error adding product:', error);
      // Handle errors appropriately, e.g., display user-friendly messages
    }
  };



  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsCollection = collection(db, 'products');
        const productsSnapshot = await getDocs(productsCollection);
        // eslint-disable-next-line no-shadow
        const productsList = productsSnapshot.docs.map(doc => doc.data());
        setProducts(productsList);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);





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
      const newSelecteds = products.map((n) => n.name);
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
    inputData: products,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;






  const [openAddProductDialog, setOpenAddProductDialog] = useState(false);

  // ... other functions

  const handleAddProductClick = () => {
    setOpenAddProductDialog(true);
  };

  const handleCloseAddProductDialog = () => {
    setOpenAddProductDialog(false);
  };



  const handleImageChange = (event) => {
    const selectedFile = event.target.files[0];

    if (!selectedFile) {
      return;
    }

    setSelectedImage(selectedFile);
  };


  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Products</Typography>

        <Button variant="contained" color="inherit" onClick={handleAddProductClick} startIcon={<Iconify icon="eva:plus-fill" />}>
          New product
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
                rowCount={products.length}
                numSelected={selected.length}
                onRequestSort={handleSort}
                onSelectAllClick={handleSelectAllClick}
                headLabel={[
                  { id: 'name', label: 'Name' },
                  {id: "id", label:'Product Code'},
                  { id: 'quantity', label: 'Quantity' },
                  { id: 'description', label: 'Description' },
                  { id: 'price', label: 'Price' },
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
                      id={row.id}
                      quantity={row.quantity}
                      description={row.description}
                      price={row.price}
                      selected={selected.indexOf(row.name) !== -1}
                      handleClick={(event) => handleClick(event, row.name)}
                    />
                  ))}

                <TableEmptyRows
                  height={77}
                  emptyRows={emptyRows(page, rowsPerPage, products.length)}
                />

                {notFound && <TableNoData query={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          page={page}
          component="div"
          count={products.length}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>



      <Dialog
        open={openAddProductDialog}
        onClose={handleCloseAddProductDialog}
        aria-labelledby="add-product-dialog-title">
        <DialogTitle id="add-product-dialog-title">Add Product</DialogTitle>
        <DialogContent>
          <TextField
            label="Product Name"
            fullWidth
            margin="normal"
            value={productName}
            onChange={(event) => handleInputChange(event, setProductName)}
            required
          />
          <TextField
            label="Product Code"
            type="number" // Ensure numerical input
            fullWidth
            margin="normal"
            value={productCode}
            onChange={(event) => handleInputChange(event, setProductCode)}
            required
          />
          <TextField
            label="Product Quantity"
            type="number" // Ensure numerical input
            fullWidth
            margin="normal"
            value={productQuantity}
            onChange={(event) => handleInputChange(event, setProductQuantity)}
            required
          />
          <TextField
            label="Product Description"
            fullWidth
            margin="normal"
            value={productDescription}
            onChange={(event) => handleInputChange(event, setProductDescription)}
            required
          />
          <TextField
            label="Product Price"
            type="number" // Ensure numerical input
            fullWidth
            margin="normal"
            value={productPrice}
            onChange={(event) => handleInputChange(event, setProductPrice)}
            required
          />

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddProductDialog} color="primary">
          Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary" disabled={!productName || !productQuantity || !productDescription || !productPrice}>
            Add Product
          </Button>
        </DialogActions>
      </Dialog>


    </Container>
  );
}
