import React from "react";
import { Link, useNavigate } from "react-router-dom";
const users = [
  {
    id: 1,
    name: "Vinod Gokul Tambe",
    phone: "9579082528, 8010445844",
    address: "Hadapsar, Pune, 411039",
    image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    createdAt: "14/11/2025",
  },
  {
    id: 2,
    name: "Rahul Patil",
    phone: "9876543210",
    address: "Wakad, Pune, 411057",
    image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    createdAt: "15/11/2025",
  },
  {
    id: 3,
    name: "Amit Kulkarni",
    phone: "9823456789",
    address: "Kothrud, Pune, 411038",
    image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    createdAt: "16/11/2025",
  },
  {
    id: 4,
    name: "Sneha Joshi",
    phone: "9765432198",
    address: "Karve Nagar, Pune, 411052",
    image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    createdAt: "17/11/2025",
  },
  {
    id: 5,
    name: "Rohit Deshmukh",
    phone: "9890123456",
    address: "Aundh, Pune, 411007",
    image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    createdAt: "18/11/2025",
  },
  {
    id: 6,
    name: "Pooja Shinde",
    phone: "9012345678",
    address: "Baner, Pune, 411045",
    image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    createdAt: "19/11/2025",
  },
  {
    id: 7,
    name: "Sanket Pawar",
    phone: "9123456789",
    address: "Pimple Saudagar, Pune, 411027",
    image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    createdAt: "20/11/2025",
  },
  {
    id: 8,
    name: "Neha Chavan",
    phone: "9988776655",
    address: "Hinjewadi, Pune, 411057",
    image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    createdAt: "21/11/2025",
  },
  {
    id: 9,
    name: "Akash Jadhav",
    phone: "9345678123",
    address: "Viman Nagar, Pune, 411014",
    image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    createdAt: "22/11/2025",
  },
  {
    id: 10,
    name: "Kiran More",
    phone: "9765123490",
    address: "Katraj, Pune, 411046",
    image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    createdAt: "23/11/2025",
  },

  {
    id: 11,
    name: "Pratik Bhosale",
    phone: "9887654321",
    address: "Bibwewadi, Pune, 411037",
    image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    createdAt: "24/11/2025",
  },
  {
    id: 12,
    name: "Komal Patil",
    phone: "9098765432",
    address: "Warje Malwadi, Pune, 411058",
    image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    createdAt: "25/11/2025",
  },
  {
    id: 13,
    name: "Swapnil Kulkarni",
    phone: "9191919191",
    address: "Shivajinagar, Pune, 411005",
    image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    createdAt: "26/11/2025",
  },
  {
    id: 14,
    name: "Shraddha Patole",
    phone: "9898989898",
    address: "Bavdhan, Pune, 411021",
    image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    createdAt: "27/11/2025",
  },
  {
    id: 15,
    name: "Nikhil Gaikwad",
    phone: "9876501234",
    address: "Sinhagad Road, Pune, 411041",
    image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    createdAt: "28/11/2025",
  },
  {
    id: 16,
    name: "Anjali Thorat",
    phone: "9123987654",
    address: "Dhanori, Pune, 411015",
    image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    createdAt: "29/11/2025",
  },
  {
    id: 17,
    name: "Saurabh Kale",
    phone: "9812345670",
    address: "Yerwada, Pune, 411006",
    image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    createdAt: "30/11/2025",
  },
  {
    id: 18,
    name: "Rutuja Mane",
    phone: "9876123456",
    address: "Lohegaon, Pune, 411047",
    image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    createdAt: "01/12/2025",
  },
  {
    id: 19,
    name: "Mahesh Yadav",
    phone: "9000012345",
    address: "Kondhwa, Pune, 411048",
    image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    createdAt: "02/12/2025",
  },
  {
    id: 20,
    name: "Pallavi Desai",
    phone: "8888877777",
    address: "Balewadi, Pune, 411045",
    image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    createdAt: "03/12/2025",
  },
];

const StaffGrid = () => {
  const navigate = useNavigate();
  return (
    <div className="card p-3 pt-2 shadow-sm">
      <div className="row pt-2 pb-3">
        <div className="col-9"> <div class="input-group">
          <input type="text" class="form-control border border-secondary" placeholder="Search User..." aria-label="Amount (to the nearest dollar)" />
          <span class="input-group-text border border-secondary"><i class="bi bi-search"></i></span>
        </div></div>
        <div className="col-3">
          <Link class="btn btn-outline-success ms-3" aria-current="page" to="#"><i class="bi bi-plus-square-dotted"></i></Link></div>
      </div>
      <div className="row g-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="col-12 col-md-6 col-lg-6 text-decoration-none"
            onClick={() => navigate(`/staff/staff-details/${user.id}`)}
            style={{ cursor: "pointer" }}
          >
            <div className="card bg-blue shadow border-dark h-100">
              <div className="card-body text-dark p-2">
                <div className="row align-items-center">
                  <div className="col-3 text-center">
                    <img
                      src={user.image}
                      alt={user.name}
                      width="80"
                      height="80"
                      className="rounded-circle border border-danger"
                    />
                  </div>

                  <div className="col-9">
                    <h5 className="card-title text-success-emphasis mb-1 fw-bold">
                      {user.name}
                    </h5>
                    <p className="m-0">
                      <strong>Phone :</strong> {user.phone}
                    </p>
                    <p className="m-0">
                      <strong>Address :</strong> {user.address}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card-footer bg-transparent border-dark d-flex align-items-center p-2 m-0">
                <button style={{ width: "15%" }} className="btn me-2 p-1 m-0 bg-secondary-subtle border-secondary" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                  {user.id}
                </button>
                <button className="btn me-2 bg-success-subtle border-secondary rounded-circle" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                  <i className="bi bi-whatsapp"></i>
                </button>
                <button className="btn me-2 bg-primary-subtle border-secondary rounded-circle" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                  <i className="bi bi-telephone-outbound"></i>
                </button>
                <button className="btn me-2 bg-info-subtle border-secondary rounded-circle" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                  <i className="bi bi-pencil-square"></i>
                </button>
                <button className="btn me-2 bg-danger-subtle border-secondary rounded-circle" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                  <i className="bi bi-trash"></i>
                </button>

                <p className="ms-auto mb-0 text-secondary">
                  - {user.createdAt}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaffGrid;