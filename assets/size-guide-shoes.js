console.log("file initialized")


document.addEventListener('DOMContentLoaded', () => {
  // Wait for the DOM to fully load
  const dropdown = document.getElementById('size-dropdown-sizeGuide'); // Ensure this ID matches your dropdown
  const table = document.querySelector('.ks-table'); // Ensure this class matches your table

  if (!dropdown) {
    console.error('Dropdown not found!');
    return;
  }

  if (!table) {
    console.error(' table not found!');
    return;
  }

  dropdown.addEventListener('change', () => {
    const columnIndex = parseInt(dropdown.value); // Parse selected value as a number
    const rows = table.querySelectorAll('tr'); // Get all rows of the table

    // Check if the value is valid
    if (isNaN(columnIndex) || columnIndex < 0) {
      console.error('Invalid column index selected:', dropdown.value);
      return;
    }

    console.log('Selected size:', dropdown.options[dropdown.selectedIndex].text);

    // Remove existing highlights
    rows.forEach(row => {
      Array.from(row.children).forEach(cell => {
        cell.classList.remove('highlight');
      });
    });

    // Highlight the selected column
    rows.forEach(row => {
      const cell = row.children[columnIndex]; // Get the cell in the selected column
      if (cell) {
        cell.classList.add('highlight');
      }
    });
  });
});


  // Test function
  function myFunction() {
    alert("Hello clicked");
  }