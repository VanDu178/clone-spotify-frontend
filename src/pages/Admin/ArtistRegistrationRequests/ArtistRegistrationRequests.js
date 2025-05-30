import React, { useEffect, useState } from "react";
import axiosInstance from "../../../config/axiosConfig";
import { handleError, handleSuccess } from "../../../helpers/toast";
import { useTranslation } from "react-i18next";
import { useUserData } from "../../../context/UserDataProvider";
import { checkData } from "../../../helpers/encryptionHelper";
import Loading from "../../../components/Loading/Loading";
import Forbidden from "../../../components/Error/403/403";
import "./ArtistRegistrationRequests.css";

const ArtistRegistrationRequests = () => {
  const { t } = useTranslation();

  const [registrations, setRegistrations] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [isConfirmingApprove, setIsConfirmingApprove] = useState(null);
  const [isConfirmingReject, setIsConfirmingReject] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Loading spinner state
  const [isProcessing, setIsProcessing] = useState(false);
  const [validRole, setValidRole] = useState(false);
  const { isLoggedIn } = useUserData();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchRole = async () => {
      setIsLoading(true);
      if (isLoggedIn) {
        //nếu đang login thì check role phải user không
        const checkedRoleUser = await checkData(1);
        if (checkedRoleUser) {
          setValidRole(true);
          setIsLoading(false);
        }
      } else {
        //nếu không login thì hiển thị
        setValidRole(false);
        setIsLoading(false);
      }
      setIsLoading(false);
    };

    fetchRole();
  }, [isLoggedIn]);

  useEffect(() => {
    getArtistRegistrationRequests(page);
  }, [page]);

  //Cách phân trang hiện tại của mình đang dùng là PageNumberPagination.
  //Cách này có vấn đề là nếu người dùng di chuyển đến trang cuối và xóa hết dữ liệu trang đó thì
  //giao diện sẽ hiển thị dữ liệu rỗng, vì request xuống backend, page hiện tại vẫn là page đã bị xóa hết dữ liệu
  //chính vì thế cần check nếu dữ liệu là rỗng và page vẫn đang lớn hơn 1 thì ta quay về page trước đó để request.
  useEffect(() => {
    if (registrations.length === 0 && page > 1) {
      setPage((prev) => prev - 1);
    }
  }, [registrations, page]);

  const getArtistRegistrationRequests = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(
        `/admin/artist-registration-requests/${page}/`
      );

      if (response?.status === 200) {
        const updatedRegistrations = response?.data.results.map(
          (registration) => ({
            ...registration,
            identity_proofs:
              registration.identity_proof?.split(",").filter(Boolean) || [],
            artist_images:
              registration.artist_image?.split(",").filter(Boolean) || [],
          })
        );

        setRegistrations(updatedRegistrations);
        setPage(page);
        setTotalPages(Math.ceil(response.data.count / 3));
      }
    } catch (error) {
      handleError(t("admin.artist_registration_requests.error_fetching"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      setIsConfirmingApprove(null);
      setIsProcessing(true); // Set loading state to true when approving
      const response = await axiosInstance.post(
        `/admin/artist-registration/artist-approve/${id}/`
      );
      if (response.status === 200) {
        setRegistrations((prev) =>
          prev.filter((registration) => registration.id !== id)
        );
        handleSuccess(t("admin.artist_registration_requests.approve_success"));
      }
    } catch (error) {
      if (error.response.status == 409) {
        handleSuccess(
          t("admin.artist_registration_requests.artistAlreadyProcessed")
        );
        setRegistrations((prev) =>
          prev.filter((registration) => registration.id !== id)
        );
      } else {
        handleError(t("admin.artist_registration_requests.approve_error"));
      }
    } finally {
      setIsProcessing(false); // Reset loading state after action
    }
  };

  const handleReject = async (id) => {
    try {
      setIsConfirmingReject(null); // Close confirmation modal
      setIsProcessing(true); // Set loading state to true when rejecting
      const response = await axiosInstance.post(
        `/admin/artist-registration/artist-reject/${id}/`
      );
      if (response.status === 200) {
        setRegistrations((prev) =>
          prev.filter((registration) => registration.id !== id)
        );
        handleSuccess(t("admin.artist_registration_requests.reject_success"));
      }
    } catch (error) {
      if (error.response.status == 409) {
        handleSuccess(
          t("admin.artist_registration_requests.artistAlreadyProcessed")
        );
        setRegistrations((prev) =>
          prev.filter((registration) => registration.id !== id)
        );
      } else {
        handleError(t("admin.artist_registration_requests.reject_error"));
      }
    } finally {
      setIsProcessing(false); // Reset loading state after action
    }
  };

  const openApproveConfirm = (id) => {
    setIsConfirmingApprove(id);
  };

  const openRejectConfirm = (id) => {
    setIsConfirmingReject(id);
  };

  const handleViewDetails = (artist) => {
    setSelectedArtist(artist);
  };

  const closeModal = () => {
    setSelectedArtist(null);
  };

  const openFullscreenImage = (imageUrl) => {
    setFullscreenImage(imageUrl);
  };

  const closeFullscreenImage = () => {
    setFullscreenImage(null);
  };

  if (isLoading) {
    return <Loading message={t("utils.loading")} height="60" />;
  }

  if (!validRole) {
    return <Forbidden />;
  }

  return (
    <div className="artist_registration_requests-container">
      <h2>{t("admin.artist_registration_requests.title")}</h2>
      {/* {isLoading ? (
        <div className="artist_registration_requests-loading-container">
          <ClipLoader size={50} color={"#123abc"} loading={isLoading} />{" "}
          <p>{t("admin.artist_registration_requests.loading")}</p>
        </div>
      ) :  */}
      {registrations.length === 0 ? (
        <p>{t("admin.artist_registration_requests.no_requests")}</p>
      ) : (
        <table className="artist_registration_requests-table">
          <thead>
            <tr>
              <th>{t("admin.artist_registration_requests.artist")}</th>
              <th>{t("admin.artist_registration_requests.email")}</th>
              <th>{t("admin.artist_registration_requests.phone")}</th>
              <th>{t("admin.artist_registration_requests.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((registration) => (
              <tr key={registration.id}>
                <td>{registration.artist_name}</td>
                <td>{registration.email}</td>
                <td>{registration.phone_number}</td>
                <td>
                  <button
                    onClick={() => handleViewDetails(registration)}
                    className="artist_registration_requests-view-btn"
                    disabled={isProcessing} // Disable button during loading
                  >
                    {t("admin.artist_registration_requests.view_details")}
                  </button>
                  <button
                    onClick={() => openApproveConfirm(registration.id)}
                    className="artist_registration_requests-approve-btn"
                    disabled={isProcessing} // Disable if already approved or loading
                  >
                    {t("admin.artist_registration_requests.approve")}
                  </button>
                  <button
                    onClick={() => openRejectConfirm(registration.id)}
                    className="artist_registration_requests-reject-btn"
                    disabled={isProcessing} // Disable if already approved or loading
                  >
                    {t("admin.artist_registration_requests.reject")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          {registrations.length > 0 && (
            <div className="artist_registration_requests-pagination">
              <button
                onClick={() => getArtistRegistrationRequests(page - 1)}
                disabled={page === 1 || isLoading}
              >
                {t("admin.artist_registration_requests.btnBack")}
              </button>
              <span>
                {page} / {totalPages}
              </span>
              <button
                onClick={() => getArtistRegistrationRequests(page + 1)}
                disabled={page === totalPages || isLoading}
              >
                {t("admin.artist_registration_requests.btnNext")}
              </button>
            </div>
          )}
        </table>
      )}
      {selectedArtist && (
        <div
          className="artist_registration_requests-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="artist_registration_requests-modal-content-detail-artist"
            onClick={(e) => e.stopPropagation()}
          >
            <span
              className="artist_registration_requests-close"
              onClick={closeModal}
            >
              ×
            </span>
            <h3>{t("admin.artist_registration_requests.artist_details")}</h3>
            <p>
              <strong>{t("admin.artist_registration_requests.name")}:</strong>{" "}
              {selectedArtist.artist_name}
            </p>
            <p>
              <strong>{t("admin.artist_registration_requests.email")}:</strong>{" "}
              {selectedArtist.email}
            </p>
            <p>
              <strong>{t("admin.artist_registration_requests.phone")}:</strong>{" "}
              {selectedArtist.phone_number}
            </p>
            <p>
              <strong>{t("admin.artist_registration_requests.bio")}:</strong>{" "}
              {selectedArtist.bio}
            </p>
            <p>
              <strong>
                {t("admin.artist_registration_requests.social_links")}:
              </strong>{" "}
              {selectedArtist.social_links ? (
                <a
                  href={selectedArtist.social_links}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("admin.artist_registration_requests.view")}
                </a>
              ) : (
                t("admin.artist_registration_requests.na")
              )}
            </p>
            <p>
              <strong>
                {t("admin.artist_registration_requests.created_at")}:
              </strong>{" "}
              {selectedArtist.created_at}
            </p>
            <p>
              <strong>{t("admin.artist_registration_requests.status")}:</strong>{" "}
              {selectedArtist.is_approved
                ? t("admin.artist_registration_requests.approved")
                : t("admin.artist_registration_requests.pending")}
            </p>

            <p>
              <strong>
                {t("admin.artist_registration_requests.identity_proofs")}:
              </strong>
            </p>
            <div className="artist_registration_requests-image-gallery">
              {selectedArtist.identity_proofs.length > 0 ? (
                selectedArtist.identity_proofs.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`ID Proof ${index + 1}`}
                    className="artist_registration_requests-thumbnail"
                    onClick={() => openFullscreenImage(img)}
                  />
                ))
              ) : (
                <p>
                  {t("admin.artist_registration_requests.no_identity_proofs")}
                </p>
              )}
            </div>

            <p>
              <strong>
                {t("admin.artist_registration_requests.artist_images")}:
              </strong>
            </p>
            <div className="artist_registration_requests-image-gallery">
              {selectedArtist.artist_images.length > 0 ? (
                selectedArtist.artist_images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Artist Image ${index + 1}`}
                    className="artist_registration_requests-thumbnail"
                    onClick={() => openFullscreenImage(img)}
                  />
                ))
              ) : (
                <p>
                  {t("admin.artist_registration_requests.no_artist_images")}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      {fullscreenImage && (
        <div
          className="artist_registration_requests-fullscreen-modal"
          onClick={closeFullscreenImage}
        >
          <img
            src={fullscreenImage}
            alt="Fullscreen"
            className="artist_registration_requests-fullscreen-img"
          />
        </div>
      )}
      {/* Modal xác nhận phê duyệt */}
      {isConfirmingApprove !== null && (
        <div className="artist_registration_requests-confirm-modal">
          <div className="artist_registration_requests-modal-content-confirm-action">
            <p>{t("admin.artist_registration_requests.confirm_approve")}</p>
            <button
              className="artist_registration_requests-confirm-btn"
              onClick={() => handleApprove(isConfirmingApprove)}
              disabled={isProcessing} // Disable button during loading
            >
              {t("admin.artist_registration_requests.yes")}
            </button>
            <button
              className="artist_registration_requests-cancel-btn"
              onClick={() => setIsConfirmingApprove(null)}
              disabled={isProcessing} // Disable button during loading
            >
              {t("admin.artist_registration_requests.no")}
            </button>
          </div>
        </div>
      )}
      {/* Modal xác nhận từ chối */}
      {isConfirmingReject !== null && (
        <div className="artist_registration_requests-confirm-modal">
          <div className="artist_registration_requests-modal-content-confirm-action">
            <p>{t("admin.artist_registration_requests.confirm_reject")}</p>
            <button
              className="artist_registration_requests-confirm-btn"
              onClick={() => handleReject(isConfirmingReject)}
              disabled={isProcessing} // Disable button during loading
            >
              {t("admin.artist_registration_requests.yes")}
            </button>
            <button
              className="artist_registration_requests-cancel-btn"
              onClick={() => setIsConfirmingReject(null)}
              disabled={isProcessing} // Disable button during loading
            >
              {t("admin.artist_registration_requests.no")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistRegistrationRequests;
