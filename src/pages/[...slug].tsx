import { GetServerSideProps } from "next";

/** Send unknown paths home — existing routes still win over this catch-all. */
export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: "/",
      permanent: false,
    },
  };
};

export default function CatchAllRedirect() {
  return null;
}
