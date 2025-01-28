try { 
  rs.status() 
} 
catch (err) { 
  rs.initiate({
    _id : "rs0", 
    members: [
      { _id: 0, host: "booking-db-0:27017" }, 
      { _id: 1, host: "booking-db-1:27017" },
      { _id: 2, host: "booking-db-2:27017" }
    ]
  })
}