// SupabaseDiagnostic.tsx
// Temporary diagnostic component - add to your app to debug issues
// Usage: Import and render this component temporarily to see what's happening

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store";

export default function SupabaseDiagnostic() {
  const { user } = useAuthStore();
  const [diagnostics, setDiagnostics] = useState<{
    connection: string;
    user: string;
    examsCount: number | string;
    examsError: string | null;
    questionsCount: number | string;
    questionsError: string | null;
    attemptsCount: number | string;
    attemptsError: string | null;
    sampleExam: any;
    rawError: any;
  }>({
    connection: "Checking...",
    user: "Checking...",
    examsCount: "Checking...",
    examsError: null,
    questionsCount: "Checking...",
    questionsError: null,
    attemptsCount: "Checking...",
    attemptsError: null,
    sampleExam: null,
    rawError: null,
  });

  useEffect(() => {
    async function runDiagnostics() {
      const results: typeof diagnostics = {
        connection: "Unknown",
        user: user ? `Logged in as ${user.email}` : "Not logged in",
        examsCount: 0,
        examsError: null,
        questionsCount: 0,
        questionsError: null,
        attemptsCount: 0,
        attemptsError: null,
        sampleExam: null,
        rawError: null,
      };

      // Test 1: Check connection
      try {
        const { data: _data, error } = await supabase
          .from("exams")
          .select("count");
        if (error) {
          results.connection = `Error: ${error.message}`;
          results.rawError = error;
        } else {
          results.connection = "Connected ✓";
        }
      } catch (e: any) {
        results.connection = `Exception: ${e.message}`;
      }

      // Test 2: Count all exams (without is_active filter)
      try {
        const {
          data,
          error,
          count: _count,
        } = await supabase.from("exams").select("*", { count: "exact" });

        if (error) {
          results.examsError = error.message;
          results.examsCount = `Error: ${error.message}`;
        } else {
          results.examsCount = data?.length || 0;
          if (data && data.length > 0) {
            results.sampleExam = data[0];
          }
        }
      } catch (e: any) {
        results.examsError = e.message;
      }

      // Test 3: Count active exams
      try {
        const { data, error } = await supabase
          .from("exams")
          .select("*")
          .eq("is_active", true);

        if (error) {
          console.error("Active exams error:", error);
        } else {
          console.log(`Found ${data?.length || 0} active exams`);
        }
      } catch (e: any) {
        console.error("Active exams exception:", e);
      }

      // Test 4: Count questions
      try {
        const { data, error } = await supabase.from("questions").select("*");

        if (error) {
          results.questionsError = error.message;
          results.questionsCount = `Error: ${error.message}`;
        } else {
          results.questionsCount = data?.length || 0;
        }
      } catch (e: any) {
        results.questionsError = e.message;
      }

      // Test 5: Count user's attempts (if logged in)
      if (user) {
        try {
          const { data, error } = await supabase
            .from("exam_attempts")
            .select("*")
            .eq("user_id", user.id);

          if (error) {
            results.attemptsError = error.message;
            results.attemptsCount = `Error: ${error.message}`;
          } else {
            results.attemptsCount = data?.length || 0;
          }
        } catch (e: any) {
          results.attemptsError = e.message;
        }
      }

      setDiagnostics(results);
    }

    runDiagnostics();
  }, [user]);

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-gray-300 rounded-xl shadow-2xl p-4 max-w-md z-50 text-sm">
      <h3 className="font-bold text-lg mb-3 text-gray-800">
        🔧 Supabase Diagnostic
      </h3>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Connection:</span>
          <span
            className={
              diagnostics.connection.includes("✓")
                ? "text-green-600 font-semibold"
                : "text-red-600 font-semibold"
            }
          >
            {diagnostics.connection}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">User:</span>
          <span className="text-gray-800 font-medium truncate max-w-[200px]">
            {diagnostics.user}
          </span>
        </div>

        <hr className="my-2" />

        <div className="flex justify-between">
          <span className="text-gray-600">Total Exams:</span>
          <span
            className={
              typeof diagnostics.examsCount === "number" &&
              diagnostics.examsCount > 0
                ? "text-green-600 font-semibold"
                : "text-orange-600 font-semibold"
            }
          >
            {diagnostics.examsCount}
          </span>
        </div>

        {diagnostics.examsError && (
          <div className="text-red-500 text-xs bg-red-50 p-2 rounded">
            Exams Error: {diagnostics.examsError}
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-gray-600">Total Questions:</span>
          <span
            className={
              typeof diagnostics.questionsCount === "number" &&
              diagnostics.questionsCount > 0
                ? "text-green-600 font-semibold"
                : "text-orange-600 font-semibold"
            }
          >
            {diagnostics.questionsCount}
          </span>
        </div>

        {diagnostics.questionsError && (
          <div className="text-red-500 text-xs bg-red-50 p-2 rounded">
            Questions Error: {diagnostics.questionsError}
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-gray-600">Your Attempts:</span>
          <span className="text-gray-800 font-medium">
            {diagnostics.attemptsCount}
          </span>
        </div>

        {diagnostics.attemptsError && (
          <div className="text-red-500 text-xs bg-red-50 p-2 rounded">
            Attempts Error: {diagnostics.attemptsError}
          </div>
        )}
      </div>

      {diagnostics.sampleExam && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-gray-600 text-xs mb-1">Sample Exam:</p>
          <div className="bg-gray-50 p-2 rounded text-xs">
            <p>
              <strong>Title:</strong> {diagnostics.sampleExam.title}
            </p>
            <p>
              <strong>Type:</strong> {diagnostics.sampleExam.exam_type}
            </p>
            <p>
              <strong>Active:</strong>{" "}
              {diagnostics.sampleExam.is_active ? "Yes ✓" : "No ✗"}
            </p>
          </div>
        </div>
      )}

      {diagnostics.rawError && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-red-600 text-xs mb-1">Raw Error:</p>
          <pre className="bg-red-50 p-2 rounded text-xs overflow-auto max-h-32">
            {JSON.stringify(diagnostics.rawError, null, 2)}
          </pre>
        </div>
      )}

      <p className="text-gray-400 text-xs mt-3">
        Remove this component after debugging
      </p>
    </div>
  );
}
