import { TablePagination, Pagination, PaginationItem } from "@mui/material";
import { FirstPage, LastPage, KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import { Box } from "@mui/material";

interface CustomPaginationProps
{
  page: number
  onPageChange: (newPage: number) => void
  pageSize: number
  onPageSizeChange: (newSize: number) => void
  rowCount: number
}

const CustomPagination: React.FC<CustomPaginationProps> = (
{
  page,
  onPageChange,
  pageSize,
  onPageSizeChange,
  rowCount,
}) =>
{
  const totalPages = Math.ceil(rowCount / pageSize)

  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
      <TablePagination
        component="div"
        count={rowCount}
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(event) => onPageSizeChange(parseInt(event.target.value, 10))}
        rowsPerPageOptions={[10, 20, 50, 100]}
        labelRowsPerPage="Rows per page:"
      />

      <Pagination
        count={totalPages}
        page={page + 1} // MUI Pagination is 1-based index
        onChange={(_, newPage) => onPageChange(newPage - 1)}
        showFirstButton
        showLastButton
        siblingCount={1}
        boundaryCount={1}
        variant="outlined"
        shape="rounded"
        size="small"
        renderItem={(item) => (
          <PaginationItem
            {...item}
            slots={{ first: FirstPage, last: LastPage, previous: KeyboardArrowLeft, next: KeyboardArrowRight }}
          />
        )}
        sx={{
          "& .MuiPaginationItem-root": {
            minWidth: "30px", // Reduce button width
            height: "30px", // Reduce button height
            fontSize: "12px", // Reduce font size
            margin: "2px", // Reduce spacing
          }
        }}
      />
    </Box>
  )
}

export default CustomPagination
