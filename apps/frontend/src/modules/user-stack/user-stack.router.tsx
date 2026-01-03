import CreateUserStackPage from "@frontend/modules/user-stack/pages/CreateUserStack.page";
import { Route, Routes } from "react-router";

const UserStackRouter = () => {
	return (
		<Routes>
      <Route path="/new" element={<CreateUserStackPage />} />
    </Routes>
	);
};

export default UserStackRouter;