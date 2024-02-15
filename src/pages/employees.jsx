import { Helmet } from 'react-helmet-async';

import { EmployeesView } from 'src/sections/employees/view';

export default function EmployeesPage() {
  return (
    <>
      <Helmet>
        <title> Blog | Mobile POS </title>
      </Helmet>

      <EmployeesView />
    </>
  );
}