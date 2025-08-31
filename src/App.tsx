import React from "react";

import Address from "@/components/Address/Address";
import AddressBook from "@/components/AddressBook/AddressBook";
import Button from "@/components/Button/Button";
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
   * - Bonus: Add a loading state in the UI while fetching addresses
   */


  const handleAddressSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // clear previous error + addresses
    setError(undefined);
    setAddresses([]);

    // basic validation
    !postCode && setError("Post Code is mandatory to find the address");
    !houseNumber && setError("House Number is mandatory to find the address");
    if(!postCode || !houseNumber) return;
    if(typeof parseInt(postCode) !== "number" || typeof parseInt(houseNumber) !== "number") {
      setError("Post Code and House Number must be valid numbers");
      return;
    }

    try {
      const res = await fetch(
        `${BASE_URL}/api/getAddresses?postcode=${postCode}&streetnumber=${houseNumber}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch addresses");
      }

      const data = await res.json();

      console.log(data, "fetched addresses");

      // newAddresses ensures each address has houseNumber and unique id as lat_long included
      const newAddresses = data?.details.map((addr: any) =>
        transformAddress({ ...addr, houseNumber: addr.houseNumber || houseNumber })
      );

      setAddresses(newAddresses);
    } catch (err) {
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

  // Hide Address and Name details forms when mandatory fields are empty
  // This ensures user cannot enter these forms without entering mandatory fields
  const showAddressDetails = addresses?.length > 0 && postCode && houseNumber;
  const showNameDetails = selectedAddress && postCode && houseNumber;

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
            <Button type="submit">Find</Button>
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

        {/* TODO: Create an <ErrorMessage /> component for displaying an error message */}
        {error && <div className="error">{error}</div>}

        {/* TODO: Add a button to clear all form fields. 
        Button must look different from the default primary button, see design. 
        Button text name must be "Clear all fields"
        On Click, it must clear all form fields, remove all search results and clear all prior
        error messages
        */}
      </Section>

      <Section variant="dark">
        <AddressBook />
      </Section>
    </main>
  );
}

export default App;
