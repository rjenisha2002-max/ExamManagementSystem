using System.ComponentModel.DataAnnotations;

namespace ExamManagementAPI.DataValidations
{
    // Runs the DataAnnotation attributes on any model and returns plain error messages
    public static class ModelValidator
    {
        public static List<string> Validate(object model)
        {
            var validationResults = new List<ValidationResult>();
            var context = new ValidationContext(model);
            Validator.TryValidateObject(model, context, validationResults, validateAllProperties: true);

            return validationResults
                .Select(vr => vr.ErrorMessage ?? "Invalid value.")
                .ToList();
        }
    }
}
