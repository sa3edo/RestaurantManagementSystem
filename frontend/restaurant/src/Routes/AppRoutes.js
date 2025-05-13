import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../Pages/Auth/Login/login";
import AddRestaurant from "../Pages/Manager/addRestaurant/AddRestaurant";
import ViewRestaurant from "../Pages/Manager/viewRestaurant/ViewRestaurant";
import UpdateRestaurant from "../Pages/Manager/UpdateRestaurant/UpdateRestaurant";
import RestaurantRequests from "../Pages/Admin/ForTesting/RestaurantsRequest/RestaurantRequests";
import MenuList from "../Pages/Manager/menuList/MenuList";
import AddFoodCategory from "../Pages/Manager/AddFoodCategory/AddFoodCategory";
import AllFoodCategory from "../Pages/Manager/AllFoodCategory/AllFoodCategory";
import UpdateCategory from "../Pages/Manager/UpdateCategory/UpdateCategory";
import AddMenuItem from "../Pages/Manager/AddMenuItem/AddMenuItem";
import UpdateMenuItem from "../Pages/Manager/UpdateMenuItem/UpdateMenuItem";
import AddTimeSlot from "../Pages/Manager/AddTimeSlot/AddTimeSlot";
import AllTimeSlots from "../Pages/Manager/AllTimeSlots/AllTimeSlots";
import CreateTable from "../Pages/Manager/CreateTable/CreateTable";
import AllTables from "../Pages/Manager/AllTables/AllTables";
import ProtectedRoute from "../components/ProtectedRoute";
import ChangePassword from "../Pages/Auth/ChangePassword/ChangePassword";
import Register from "../Pages/Auth/Register/Register ";
import Unauthorized from "../components/Unauthorized/Unauthorized";
import AllRestaurants from "../Pages/Customer/AllRestaurants/AllRestaurants";
import RestaurantDetails from "../Pages/Customer/RestaurantDetails/RestaurantDetails";
import SearchResults from "../Pages/Customer/SearchResults/SearchResults";
import ViewReservations from "../Pages/Manager/ViewReservations/ViewReservations";
import ViewOrders from "../Pages/Manager/ViewOrders/ViewOrders";
import GetAllUsers from "../Pages/Admin/GetAllUsers/GetAllUsers";
import AddResMang from "../Pages/Admin/AddResMang/AddResMang";
import AddAdminRes from "../Pages/Admin/AddAdminRes/AddAdminRes";
import AddAdminCategory from "../Pages/Admin/AddFoodCategory/AddAdminCategory";
import ShowFoodCategory from "../Pages/Admin/ShowFoodCategory/ShowFoodCategory";
import UpdateFoodCategory from "../Pages/Admin/UpdateFoodCategory/UpdateFoodCategory";
import ShowAllRes from "../Pages/Admin/showAllRes/ShowAllRes";
import AdminRes from "../Pages/Admin/AdminRes/AdminRes";
import UpdateRes from "../Pages/Admin/UpdateRes/UpdateRes";
import MakeOrder from "../Pages/Customer/MakeOrder/MakeOrder";
import GetAllOrders from "../Pages/Admin/GetAllOrders/getAllOrders";
import MyOrders from "../Pages/Customer/myOrders/MyOrders";
import MakeReview from "../Pages/Customer/makeReview/makeReview";
import CreateReservation from "../Pages/Customer/createReservation/createReservation";
import MyReservations from "../Pages/Customer/myReservations/MyReservations";
import GetRestaurantReviews from "../Pages/Admin/getRestaurantReviews/GetRestaurantReviews";
import ManagerReviews from "../Pages/Manager/managerReviews/managerReviews";
import ShowReservations from "../Pages/Admin/ShowReservations/ShowReservations";
import PaymentComponent from "../Pages/Customer/payment/PaymentComponent";
import PaymentSuccess from "../Pages/Customer/payment/PaymentSuccess";
import CancelPayment from "../Pages/Customer/payment/CancelPayment";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/changePassword" element={<ChangePassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <GetAllUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/GetAllUsers"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <GetAllUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/add-restaurant-manager"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AddResMang />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/add-restaurant"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AddAdminRes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/addFoodCategory/:restaurantID"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AddAdminCategory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/show-food-categories/:restaurantId"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <ShowFoodCategory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/update-food-category/:categoryId"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <UpdateFoodCategory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/all-restaurants"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <ShowAllRes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/admin-restaurants"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminRes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/update-restaurant/:id"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <UpdateRes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/getAllOrders"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <GetAllOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/GetRestaurantReviews"
        element={
          <ProtectedRoute roles={["Admin"]}>
            <GetRestaurantReviews />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/ShowReservations"
        element={
          <ProtectedRoute roles={["Admin"]}>
            <ShowReservations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/addRestaurant"
        element={
          <ProtectedRoute allowedRoles={["RestaurantManager"]}>
            <AddRestaurant />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/GetRestaurant"
        element={
          <ProtectedRoute allowedRoles={["RestaurantManager"]}>
            <ViewRestaurant />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/updateRestaurant/:id"
        element={
          <ProtectedRoute allowedRoles={["RestaurantManager"]}>
            <UpdateRestaurant />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/restaurantsRequest"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <RestaurantRequests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/menuList"
        element={
          <ProtectedRoute allowedRoles={["RestaurantManager"]}>
            <MenuList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/viewMenu/:restaurantID"
        element={
          <ProtectedRoute allowedRoles={["RestaurantManager"]}>
            <MenuList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/updateMenu/:menuItemID/:restaurantID/:categoryID"
        element={
          <ProtectedRoute allowedRoles={["RestaurantManager"]}>
            <UpdateMenuItem />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/addFoodCategory/:restaurantID"
        element={
          <ProtectedRoute allowedRoles={["RestaurantManager"]}>
            <AddFoodCategory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/updateCategory/:categoryID/:restaurantID"
        element={
          <ProtectedRoute allowedRoles={["RestaurantManager"]}>
            <UpdateCategory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/AllCategory/:restaurantID"
        element={
          <ProtectedRoute allowedRoles={["RestaurantManager"]}>
            <AllFoodCategory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/addMenuItem/:restaurantID/:categoryID"
        element={
          <ProtectedRoute allowedRoles={["RestaurantManager"]}>
            <AddMenuItem />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/addTimeSlot/:restaurantID"
        element={
          <ProtectedRoute allowedRoles={["RestaurantManager"]}>
            <AddTimeSlot />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/timeSlots/:restaurantID"
        element={
          <ProtectedRoute allowedRoles={["RestaurantManager"]}>
            <AllTimeSlots />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/createTable/:restaurantID"
        element={
          <ProtectedRoute allowedRoles={["RestaurantManager"]}>
            <CreateTable />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/AllTables/:restaurantID"
        element={
          <ProtectedRoute allowedRoles={["RestaurantManager"]}>
            <AllTables />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/viewReservations/:restaurantID"
        element={
          <ProtectedRoute allowedRoles={["RestaurantManager"]}>
            <ViewReservations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/viewOrders/:restaurantID"
        element={
          <ProtectedRoute allowedRoles={["RestaurantManager"]}>
            <ViewOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/allRestaurants"
        element={
          <ProtectedRoute allowedRoles={["Customer"]}>
            <AllRestaurants />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/allRestaurants/details/:restaurantID"
        element={
          <ProtectedRoute allowedRoles={["Customer"]}>
            <RestaurantDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/makeOrder/:restaurantID"
        element={
          <ProtectedRoute allowedRoles={["Customer"]}>
            <MakeOrder />
          </ProtectedRoute>
        }
      />
      <Route path="/search" element={<SearchResults />} />
      <Route
        path="/customer/my-orders"
        element={
          <ProtectedRoute allowedRoles={["Customer"]}>
            <MyOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/makeReview/:restaurantId"
        element={
          <ProtectedRoute allowedRoles={["Customer"]}>
            <MakeReview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/createReservation/:restaurantId"
        element={
          <ProtectedRoute allowedRoles={["Customer"]}>
            <CreateReservation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/my-reservations"
        element={
          <ProtectedRoute allowedRoles={["Customer"]}>
            <MyReservations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/managerReviews"
        element={
          <ProtectedRoute roles={["Manager"]}>
            <ManagerReviews />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/payment/:orderId"
        element={
          <ProtectedRoute allowedRoles={["Customer"]}>
            <PaymentComponent />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment/success"
        element={
          <ProtectedRoute allowedRoles={["Customer"]}>
            <PaymentSuccess />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment/cancel"
        element={
          <ProtectedRoute allowedRoles={["Customer"]}>
            <CancelPayment />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
