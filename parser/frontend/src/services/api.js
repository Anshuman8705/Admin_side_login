const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";

/**
 * Parse Django response safely.
 *
 * Django normally returns JSON for our API endpoints.
 * If Django returns an HTML error page, this function
 * captures the actual response instead of hiding it.
 */
async function handleResponse(response) {
  const contentType =
    response.headers.get("content-type") || "";

  const responseText = await response.text();

  let data = null;

  if (contentType.includes("application/json")) {
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(
        `Server returned invalid JSON (HTTP ${response.status}).`
      );
    }
  }

  if (!response.ok) {
    if (data?.error) {
      throw new Error(data.error);
    }

    throw new Error(
      `Backend request failed with HTTP ${response.status}.`
    );
  }

  if (!data) {
    throw new Error(
      `Backend returned a non-JSON response (HTTP ${response.status}).`
    );
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}

/**
 * Validate EDI content.
 *
 * Existing Django endpoint:
 * POST /api/validate/
 */
export async function validateEDI(ediText) {
  const response = await fetch(
    `${API_BASE_URL}/api/validate/`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        edi_text: ediText,
      }),
    }
  );

  return handleResponse(response);
}

/**
 * Convert EDI to MIR.
 *
 * Existing Django endpoint:
 * POST /api/convert/
 */
export async function convertEDI(ediText) {
  const response = await fetch(
    `${API_BASE_URL}/api/convert/`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        edi_text: ediText,
      }),
    }
  );

  return handleResponse(response);
}

/**
 * Download MIR file.
 *
 * Existing Django endpoint:
 * POST /api/download/
 */
export async function downloadMIR(
  mirContent,
  fileName
) {
  const formData = new URLSearchParams();

  formData.append(
    "mir_content",
    mirContent
  );

  formData.append(
    "file_name",
    fileName
  );

  const response = await fetch(
    `${API_BASE_URL}/api/download/`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },

      body: formData.toString(),
    }
  );

  if (!response.ok) {
    throw new Error(
      `MIR download failed with HTTP ${response.status}.`
    );
  }

  return response.blob();
}