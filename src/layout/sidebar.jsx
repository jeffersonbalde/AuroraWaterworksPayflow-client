// src/layout/Sidebar.jsx - UPDATED WITH DELINQUENT SUPPORT
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLocation, Link } from "react-router-dom";

const Sidebar = ({ onCloseSidebar }) => {
  const {
    user,
    isAdmin,
    isStaff,
    isClient,
    isPending,
    isRejected,
    isApproved,
    isDelinquent, // ADD THIS
    pendingApprovals,
  } = useAuth();

  const location = useLocation();

  const isActiveLink = (href) => {
    return location.pathname === href;
  };

  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 768 && onCloseSidebar) {
      onCloseSidebar();
    }
  };

  const handleLinkClick = () => {
    closeSidebarOnMobile();
  };

  const adminStaffMenuItems = [
    {
      heading: "Core",
      items: [
        {
          icon: "fas fa-tachometer-alt",
          label: "Dashboard",
          href: "/dashboard",
        },
      ],
    },
    {
      heading: "User Management",
      items: [
        ...(isAdmin
          ? [
              {
                icon: "fas fa-users-cog",
                label: "Staff Management",
                href: "/management/staff",
              },
            ]
          : []),
        {
          icon: "fas fa-user-check",
          label: "Account Approvals",
          href: "/management/approvals",
          badge: pendingApprovals,
        },
      ],
    },
    {
      heading: "Waterworks Management",
      items: [
        {
          icon: "fas fa-users",
          label: "Customer Management",
          href: "/management/customers",
        },
        {
          icon: "fas fa-tachometer-alt",
          label: "Meter Reading",
          href: "/management/meter-reading",
        },
      ],
    },
    {
      heading: "Billing & Payments",
      items: [
        {
          icon: "fas fa-file-invoice-dollar",
          label: "Billing Management",
          href: "/management/billing",
        },
        {
          icon: "fas fa-money-bill-wave",
          label: "Payment Tracking",
          href: "/management/payments",
        },
      ],
    },
    {
      heading: "Reports",
      items: [
        {
          icon: "fas fa-file-alt",
          label: "Collection Reports",
          href: "/management/reports",
        },
      ],
    },
  ];

  // Client/Customer Menu Items (for approved AND delinquent clients)
  const clientMenuItems = [
    {
      heading: "Dashboard",
      items: [
        {
          icon: "fas fa-tachometer-alt",
          label: "Overview",
          href: "/dashboard",
        },
      ],
    },
    {
      heading: "My Account",
      items: [
        {
          icon: "fas fa-file-invoice-dollar",
          label: "My Bills",
          href: "/my-bills",
          // ADD DELINQUENT WARNING BADGE
          badge: isDelinquent ? "!" : undefined,
          badgeColor: isDelinquent ? "warning" : undefined,
        },
        {
          icon: "fas fa-history",
          label: "Payment History",
          href: "/payment-history",
        },
        {
          icon: "fas fa-water",
          label: "Water Usage",
          href: "/water-usage",
        },
        {
          icon: "fas fa-credit-card",
          label: "Make Payment",
          href: "/make-payment",
          // HIGHLIGHT PAYMENT OPTION FOR DELINQUENT USERS
          badge: isDelinquent ? "Urgent" : undefined,
          badgeColor: isDelinquent ? "danger" : undefined,
        },
      ],
    },
  ];

  // Pending Approval Menu Items
  const pendingMenuItems = [
    {
      heading: "Account Status",
      items: [
        {
          icon: "fas fa-clock",
          label: "Pending Approval",
          href: "/dashboard",
        },
      ],
    },
  ];

  // Rejected User Menu Items
  const rejectedMenuItems = [
    {
      heading: "Account Status",
      items: [
        {
          icon: "fas fa-times-circle",
          label: "Account Rejected",
          href: "/dashboard",
        },
      ],
    },
  ];

  // UPDATED: Proper menu selection logic with delinquent support
  let menuItems = [];

  if (isPending) {
    menuItems = pendingMenuItems;
  } else if (isRejected) {
    menuItems = rejectedMenuItems;
  } else if (isAdmin || isStaff) {
    menuItems = adminStaffMenuItems;
  } else if (isClient && (isApproved || isDelinquent)) { // MODIFIED THIS LINE
    menuItems = clientMenuItems;
  } else {
    // Fallback for any unhandled cases
    menuItems = pendingMenuItems;
  }

  const renderMenuSection = (section, index) => (
    <React.Fragment key={index}>
      <div className="sb-sidenav-menu-heading">{section.heading}</div>
      {section.items.map((item, itemIndex) => {
        const isActive = isActiveLink(item.href);
        return (
          <Link
            key={itemIndex}
            className={`nav-link ${isActive ? "active" : ""}`}
            to={item.href}
            onClick={handleLinkClick}
          >
            <div className="sb-nav-link-icon">
              <i className={item.icon}></i>
            </div>
            {item.label}
            {/* Enhanced badge system */}
            {item.badge !== undefined && (
              <span 
                className={`badge ms-2 ${
                  item.badgeColor === 'danger' ? 'bg-danger' :
                  item.badgeColor === 'warning' ? 'bg-warning text-dark' :
                  'bg-danger'
                }`}
              >
                {item.badge}
              </span>
            )}
            {isActive && (
              <span className="position-absolute top-50 end-0 translate-middle-y me-3">
                <i className="fas fa-chevron-right small"></i>
              </span>
            )}
          </Link>
        );
      })}
    </React.Fragment>
  );

  return (
    <nav className="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">

      <div className="sb-sidenav-menu">
        <div className="nav">
          {menuItems.map(renderMenuSection)}

          {/* Common Settings for All Users */}
          {/* Show Profile for ALL users, but Settings only for Admin and Client */}
          {(isAdmin || isStaff || (isClient && (isApproved || isDelinquent)) || isPending || isRejected) && ( // MODIFIED THIS LINE
            <>
              <div className="sb-sidenav-menu-heading">Settings</div>

              {/* Profile - Show for ALL users (Admin, Staff, Client, Pending, Rejected, Delinquent) */}
              <Link
                className={`nav-link ${
                  isActiveLink("/profile") ? "active" : ""
                }`}
                to="/profile"
                onClick={handleLinkClick}
              >
                <div className="sb-nav-link-icon">
                  <i className="fas fa-user"></i>
                </div>
                Profile
                {isActiveLink("/profile") && (
                  <span className="position-absolute top-50 end-0 translate-middle-y me-3">
                    <i className="fas fa-chevron-right small"></i>
                  </span>
                )}
              </Link>

              {/* Settings - Show for Admin and ALL Clients (including delinquent) */}
              {(isAdmin || (isClient && (isApproved || isDelinquent))) && ( // MODIFIED THIS LINE
                <Link
                  className={`nav-link ${
                    isActiveLink("/settings") ? "active" : ""
                  }`}
                  to="/settings"
                  onClick={handleLinkClick}
                >
                  <div className="sb-nav-link-icon">
                    <i className="fas fa-cog"></i>
                  </div>
                  Settings
                  {isActiveLink("/settings") && (
                    <span className="position-absolute top-50 end-0 translate-middle-y me-3">
                      <i className="fas fa-chevron-right small"></i>
                    </span>
                  )}
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      <div className="sb-sidenav-footer">
        <div className="small">Logged in as:</div>
        <span className="user-name">{user?.name || "User"}</span>
        <div className="small text-muted">
          {isAdmin
            ? "System Administrator"
            : isStaff
            ? "Staff Member"
            : isPending
            ? "Pending Approval"
            : isRejected
            ? "Account Rejected"
            : isDelinquent // ADD THIS
            ? "Customer (Delinquent)"
            : "Customer"}
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;