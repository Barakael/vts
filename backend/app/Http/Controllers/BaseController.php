<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;

class BaseController extends Controller
{
    /**
     * Send a success response
     *
     * @param mixed $data
     * @param string $message
     * @param int $statusCode
     * @return JsonResponse
     */
    protected function sendResponse($data, string $message, int $statusCode = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => $message
        ], $statusCode);
    }

    /**
     * Send an error response
     *
     * @param string $message
     * @param mixed $errors
     * @param int $statusCode
     * @return JsonResponse
     */
    protected function sendError(string $message, $errors = [], int $statusCode = 400): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message
        ];

        if (!empty($errors)) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $statusCode);
    }

    /**
     * return redirection response.
     *
     * @param $message
     * @param array $data
     * @return JsonResponse
     */
    public function sendRedirect($message, $data = [])
    {
        $response = [
            'success' => 'redirect',
            'status_code' => 1,
            'message' => $message,
            'data' => $data,
        ];
        if (!empty($errorMessages)) {
            $response['data'] = $errorMessages;
        }
        return response()->json($response);
    }

    /**
     * return failed response.
     *
     * @return JsonResponse
     */
    public function failedRequest()
    {
        $response = [
            'success' => false,
            'message' => 'Something Went Wrong',
        ];

        return response()->json($response);
    }
}