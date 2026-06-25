function Pagination({ page, totalPages, onPageChange }) {
  return (
    <div style={{ marginTop: "20px", textAlign: "center" }}>
      <button
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </button>

      <span style={{ margin: "0 15px" }}>
        Page {page + 1} of {totalPages}
      </span>

      <button
        disabled={page + 1 >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;