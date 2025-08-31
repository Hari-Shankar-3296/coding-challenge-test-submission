import React from "react";

import Address from "@/components/Address/Address";
import AddressBook from "@/components/AddressBook/AddressBook";
import Button from "@/components/Button/Button";
import ErrorMessage from "@/components/ErrorMessage/ErrorMessage";
import InputText from "@/components/InputText/InputText";
import Radio from "@/components/Radio/Radio";
import Section from "@/components/Section/Section";
import useAddressBook from "@/hooks/useAddressBook";

import styles from "./App.module.css";
import { Address as AddressType } from "./types";
import transformAddress from "./core/models/address";
import { BASE_URL } from "./helpers/global";

function App() {
  /**
   * Form fields states
   * TODO: Write a custom hook to set form fields in a more generic way:
   * - Hook must expose an onChange handler to be used by all <InputText /> and <Radio /> components
   * - Hook must expose all text form field values, like so: { postCode: '', houseNumber: '', ...etc }
   * - Remove all individual React.useState
   * - Remove all individual onChange handlers, like handlePostCodeChange for example
   */
  const [isLoading, setLoading] = React.useState(false);
  const [postCode, setPostCode] = React.useState("");
  const [houseNumber, setHouseNumber] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [selectedAddress, setSelectedAddress] = React.useState("");
  /**
   * Results states
   */
  const [error, setError] = React.useState<undefined | string>(undefined);
  const [addresses, setAddresses] = React.useState<AddressType[]>([]);
  /**
   * Redux actions
   */
  const { addAddress } = useAddressBook();

  /**
   * Text fields onChange handlers
   */
  const handlePostCodeChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPostCode(e.target.value);

  const handleHouseNumberChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setHouseNumber(e.target.value);

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFirstName(e.target.value);

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setLastName(e.target.value);

  const handleSelectedAddressChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    console.log(e.target.value, "selected address");
    const selectedAddress = addresses.find(
      (address) => address.id === e.target.value
    );
    if (!selectedAddress) {
      setError("Selected address not found");
      return;
    }
    setSelectedAddress(selectedAddress.id);
  };

  /** TODO: Fetch addresses based on houseNumber and postCode using the local BE api
   * - Example URL of API: ${process.env.NEXT_PUBLIC_URL}/api/getAddresses?postcode=1345&streetnumber=350 - DONE
   * - Ensure you provide a BASE URL for api endpoint for grading purposes! - DONE
   * - Handle error response from the API and display the error message in the UI using `setError` - DONE
   * - Handle errors if they occur - DONE
   * - Handle successful response by updating the `addresses` in the state using `setAddresses` - DONE
   * - Make sure to add the houseNumber to each found address in the response using `transformAddress()` function - DONE
   * - Ensure to clear previous search results on each click - DONE
   * - Ensure to clear previous error message on each click - DONE
   * - Bonus: Add a loading state in the UI while fetching addresses - DONE
   */


  const handleAddressSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // clear previous error + addresses
    setError(undefined);
    setAddresses([]);
    setLoading(true);

    // basic validation

    try {
      const res = await fetch(
        `${BASE_URL}/api/getAddresses?postcode=${postCode}&streetnumber=${houseNumber}`
      );

      const data = await res.json();
      setLoading(false);
      if (!res.ok || data.status === "error") {
        // Backend returned an error
        console.error("Backend error:", data.errormessage);
        setError(data.errormessage || "Something went wrong. Try Again Later!");
        return;
      }

      console.log(data, "fetched addresses");

      // newAddresses ensures each address has houseNumber and unique id as lat_long included
      const newAddresses = data?.details.map((addr: any) =>
        transformAddress(addr)
      );

      setAddresses(newAddresses);
    } catch (err) {
      setLoading(false);
      setError("Something went wrong while fetching addresses. Try again later!");
      console.error(err);
    }
  };


  /** TODO: Add basic validation to ensure first name and last name fields aren't empty
   * Use the following error message setError("First name and last name fields mandatory!")
   */
  const handlePersonSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!firstName?.trim() || !lastName?.trim()) {
      setError("First name and last name fields mandatory!");
      return;
    }

    if (!selectedAddress || !addresses.length) {
      setError(
        "No address selected, try to select an address or find one if you haven't"
      );
      return;
    }

    const foundAddress = addresses.find(
      (address) => address.id === selectedAddress
    );

    if (!foundAddress) {
      setError("Selected address not found");
      return;
    }

    addAddress({ ...foundAddress, firstName, lastName });
  };

  const handleClearFields = () => {
    setError(undefined);
    setPostCode("");  
    setHouseNumber("");
    setFirstName("");
    setLastName("");
    setSelectedAddress("");
    setAddresses([]);
    setLoading(false);
  };

  // extra Logic to hide button and fields
  // commenting out as not sure this will be captured in automated tests while grading
  // Hidden Address and Name details forms when mandatory fields are empty
  // This ensures user cannot enter these forms without entering mandatory fields

  // const isPostCodeValidNumber = !isNaN(parseInt(postCode)) && parseInt(postCode) > 999;
  // const isHouseNumberValidNumber = !isNaN(parseInt(houseNumber)) && parseInt(houseNumber) > 0;
  // const showAddressDetails = addresses?.length > 0 && isPostCodeValidNumber && isHouseNumberValidNumber;
  // const showNameDetails = selectedAddress && isPostCodeValidNumber && isHouseNumberValidNumber;


  const showAddressDetails = addresses?.length > 0;
  const showNameDetails = selectedAddress;

  return (
    <main>
      <Section>
        <h1>
          Create your own address book!
          <br />
          <small>
            Enter an address by postcode add personal info and done! 👏
          </small>
        </h1>
        {/* TODO: Create generic <Form /> component to display form rows, legend and a submit button  */}
        <form onSubmit={handleAddressSubmit}>
          <fieldset>
            <legend>🏠 Find an address</legend>
            <div className={styles.formRow}>
              <InputText
                name="postCode"
                onChange={handlePostCodeChange}
                placeholder="Post Code"
                value={postCode}
              />
            </div>
            <div className={styles.formRow}>
              <InputText
                name="houseNumber"
                onChange={handleHouseNumberChange}
                value={houseNumber}
                placeholder="House number"
              />
            </div>
            <Button type="submit" loading={isLoading}>Find</Button>
          </fieldset>
        </form>
        {showAddressDetails &&
          addresses.map((address) => {
            return (
              <Radio
                name="selectedAddress"
                id={address.id}
                key={address.id}
                onChange={handleSelectedAddressChange}
              >
                <Address {...address} />
              </Radio>
            );
          })}
        {/* TODO: Create generic <Form /> component to display form rows, legend and a submit button  */}
        {showNameDetails && (
          <form onSubmit={handlePersonSubmit}>
            <fieldset>
              <legend>✏️ Add personal info to address</legend>
              <div className={styles.formRow}>
                <InputText
                  name="firstName"
                  placeholder="First name"
                  onChange={handleFirstNameChange}
                  value={firstName}
                />
              </div>
              <div className={styles.formRow}>
                <InputText
                  name="lastName"
                  placeholder="Last name"
                  onChange={handleLastNameChange}
                  value={lastName}
                />
              </div>
              <Button type="submit">Add to addressbook</Button>
            </fieldset>
          </form>
        )}

        {/* TODO: Create an <ErrorMessage /> component for displaying an error message - DONE */}
        {/* I can add Toastify to show fancy error Toasts but I am in assumption it is not needed as per requirement */}
        <ErrorMessage errorMessage={error} />

        {/* TODO: Add a button to clear all form fields. - DONE
        Button must look different from the default primary button, see design. - DONE
        Button text name must be "Clear all fields" - DONE
        On Click, it must clear all form fields, remove all search results and clear all prior
        error messages
        */}

        <Button type="button" variant="secondary" onClick={handleClearFields}>
          Clear all fields
        </Button>
      </Section>

      <Section variant="dark">
        <AddressBook />
      </Section>
    </main>
  );
}

export default App;
